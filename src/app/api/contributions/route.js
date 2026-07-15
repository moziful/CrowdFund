import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch contributions
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const supporterEmail = searchParams.get("supporterEmail");
    const creatorEmail = searchParams.get("creatorEmail");

    const { db } = await connectToDatabase();

    if (supporterEmail) {
      // Find contributions made by this supporter
      const contributions = await db
        .collection("contributions")
        .find({ supporterEmail: supporterEmail.toLowerCase() })
        .sort({ date: -1 })
        .toArray();
      return NextResponse.json(contributions);
    }

    if (creatorEmail) {
      // Find contributions for campaigns created by this creator
      const creatorCampaigns = await db
        .collection("campaigns")
        .find({ creatorEmail: creatorEmail.toLowerCase() })
        .toArray();

      const campaignIds = creatorCampaigns.map((c) => String(c._id || c.id));

      const contributions = await db
        .collection("contributions")
        .find({ campaignId: { $in: campaignIds } })
        .sort({ date: -1 })
        .toArray();

      return NextResponse.json(contributions);
    }

    // Default: return all contributions (for admin use)
    const allContributions = await db
      .collection("contributions")
      .find({})
      .sort({ date: -1 })
      .toArray();
    return NextResponse.json(allContributions);
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

      return NextResponse.json({ message: "Contribution rejected and supporter credits refunded." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("PUT Contribution Error:", error);
    return NextResponse.json({ error: "Failed to process contribution." }, { status: 500 });
  }
}
