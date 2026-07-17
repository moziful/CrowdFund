import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Next.js to never cache this route — data changes frequently
export const dynamic = "force-dynamic";

// GET: Fetch contributions
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const supporterEmail = searchParams.get("supporterEmail");
    const creatorEmail = searchParams.get("creatorEmail");
    const page = parseInt(searchParams.get("page")) || 0;
    const limit = parseInt(searchParams.get("limit")) || 5;

    const { db } = await connectToDatabase();

    let query = {};
    if (supporterEmail) {
      query.supporterEmail = supporterEmail.toLowerCase();
    } else if (creatorEmail) {
      // Find contributions for campaigns created by this creator
      const creatorCampaigns = await db
        .collection("campaigns")
        .find({ creatorEmail: creatorEmail.toLowerCase() })
        .toArray();

      const campaignIds = creatorCampaigns.map((c) => String(c._id || c.id));
      query.campaignId = { $in: campaignIds };
    }

    if (page > 0) {
      const skip = (page - 1) * limit;
      const totalContributions = await db.collection("contributions").countDocuments(query);
      const contributions = await db
        .collection("contributions")
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return NextResponse.json({
        contributions,
        totalPages: Math.ceil(totalContributions / limit),
        currentPage: page,
        totalContributions,
      });
    }

    const contributions = await db
      .collection("contributions")
      .find(query)
      .sort({ date: -1 })
      .toArray();
    return NextResponse.json(contributions);
  } catch (error) {
    console.error("GET Contributions Error:", error);
    return NextResponse.json({ error: "Failed to fetch contributions." }, { status: 500 });
  }
}

// POST: Backer creates a new pledge (deducts credits immediately)
export async function POST(req) {
  try {
    const { campaignId, campaignTitle, amount, supporterEmail, supporterName, creatorName } = await req.json();

    if (!campaignId || !campaignTitle || !amount || !supporterEmail || !supporterName || !creatorName) {
      return NextResponse.json({ error: "Missing required pledge details." }, { status: 400 });
    }

    const pledgeAmount = Number(amount);
    if (pledgeAmount <= 0) {
      return NextResponse.json({ error: "Contribution amount must be greater than zero." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Verify campaign exists
    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(campaignId) });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (pledgeAmount < campaign.minimum_contribution) {
      return NextResponse.json({ error: `Minimum contribution for this campaign is ${campaign.minimum_contribution} credits.` }, { status: 400 });
    }

    // Verify backer has enough credits
    const backer = await db.collection("users").findOne({ email: supporterEmail.toLowerCase() });
    if (!backer || backer.credits < pledgeAmount) {
      return NextResponse.json({ error: "Insufficient credits. Please purchase more credits to support this campaign." }, { status: 400 });
    }

    // Deduct credits from backer
    await db.collection("users").updateOne(
      { email: supporterEmail.toLowerCase() },
      { $inc: { credits: -pledgeAmount } }
    );

    // Save contribution record as pending
    const newContribution = {
      campaignId,
      campaignTitle,
      amount: pledgeAmount,
      supporterEmail: supporterEmail.toLowerCase(),
      supporterName,
      creatorName,
      status: "pending",
      date: new Date(),
    };

    await db.collection("contributions").insertOne(newContribution);

    // Notify creator of new pending contribution
    try {
      await db.collection("notifications").insertOne({
        message: `New pledge of ${pledgeAmount} credits submitted by ${supporterName} on your campaign "${campaignTitle}".`,
        toEmail: campaign.creatorEmail.toLowerCase(),
        actionRoute: "/dashboard?tab=overview",
        category: "contributions",
        time: new Date(),
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to generate creator notification for pledge:", notifErr);
    }

    return NextResponse.json({ message: "Pledge placed successfully! Awaiting creator approval." }, { status: 201 });
  } catch (error) {
    console.error("POST Contribution Error:", error);
    return NextResponse.json({ error: "Failed to place contribution." }, { status: 500 });
  }
}

// PUT: Creator approves or rejects a contribution
export async function PUT(req) {
  try {
    const { contributionId, action } = await req.json();

    if (!contributionId || !action) {
      return NextResponse.json({ error: "Missing contribution ID or action." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const contributionOid = new ObjectId(contributionId);

    const contribution = await db.collection("contributions").findOne({ _id: contributionOid });
    if (!contribution) {
      return NextResponse.json({ error: "Contribution record not found." }, { status: 404 });
    }

    if (contribution.status !== "pending") {
      return NextResponse.json({ error: "This contribution has already been processed." }, { status: 400 });
    }

    if (action === "approve") {
      // 1. Mark contribution approved
      await db.collection("contributions").updateOne(
        { _id: contributionOid },
        { $set: { status: "approved", processedAt: new Date() } }
      );

      // 2. Increment campaign raised amount
      await db.collection("campaigns").updateOne(
        { _id: new ObjectId(contribution.campaignId) },
        { $inc: { amount_raised: contribution.amount } }
      );

      // 3. Notify supporter of pledge approval
      try {
        await db.collection("notifications").insertOne({
          message: `Your pledge of ${contribution.amount} credits for "${contribution.campaignTitle}" was approved by the creator!`,
          toEmail: contribution.supporterEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=contributions",
          category: "contributions",
          time: new Date(),
          read: false,
        });

        // 4. Check if campaign goal is met and notify creator if complete
        const updatedCampaign = await db.collection("campaigns").findOne({ _id: new ObjectId(contribution.campaignId) });
        if (updatedCampaign && updatedCampaign.amount_raised >= updatedCampaign.funding_goal) {
          await db.collection("notifications").insertOne({
            message: `Congratulations! Your campaign "${updatedCampaign.title}" has reached its funding goal of ${updatedCampaign.funding_goal} credits!`,
            toEmail: updatedCampaign.creatorEmail.toLowerCase(),
            actionRoute: "/dashboard?tab=my-campaigns",
            category: "contributions",
            time: new Date(),
            read: false,
          });
        }
      } catch (notifErr) {
        console.error("Failed to generate notifications on contribution approval:", notifErr);
      }

      return NextResponse.json({ message: "Contribution approved successfully!" });
    }

    if (action === "reject") {
      // 1. Mark contribution rejected
      await db.collection("contributions").updateOne(
        { _id: contributionOid },
        { $set: { status: "rejected", processedAt: new Date() } }
      );

      // 2. Refund credits back to supporter
      await db.collection("users").updateOne(
        { email: contribution.supporterEmail.toLowerCase() },
        { $inc: { credits: contribution.amount } }
      );

      // 3. Notify supporter of pledge rejection
      try {
        await db.collection("notifications").insertOne({
          message: `Your pledge of ${contribution.amount} credits for "${contribution.campaignTitle}" was rejected. Credits have been refunded to your balance.`,
          toEmail: contribution.supporterEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=contributions",
          category: "contributions",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Failed to generate notification on contribution rejection:", notifErr);
      }

      return NextResponse.json({ message: "Contribution rejected and supporter credits refunded." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("PUT Contribution Error:", error);
    return NextResponse.json({ error: "Failed to process contribution." }, { status: 500 });
  }
}
