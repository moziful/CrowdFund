import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Next.js to never cache this route — data changes frequently
export const dynamic = "force-dynamic";

// GET: Fetch campaigns (filtered by creator email if query parameter exists)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const { db } = await connectToDatabase();
    let query = {};
    if (email) {
      query.creatorEmail = email.toLowerCase();
    }

    const campaigns = await db
      .collection("campaigns")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("GET Campaigns Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns." },
      { status: 500 }
    );
  }
}

// POST: Add new campaign
export async function POST(req) {
  try {
    const {
      title,
      story,
      category,
      funding_goal,
      minimum_contribution,
      deadline,
      reward_info,
      image_url,
      creatorEmail,
      creatorName,
    } = await req.json();

    if (
      !title ||
      !story ||
      !category ||
      !funding_goal ||
      !minimum_contribution ||
      !deadline ||
      !reward_info ||
      !image_url ||
      !creatorEmail ||
      !creatorName
    ) {
      return NextResponse.json(
        { error: "All campaign fields are required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const newCampaign = {
      title,
      story,
      category,
      funding_goal: Number(funding_goal),
      minimum_contribution: Number(minimum_contribution),
      deadline: new Date(deadline),
      reward_info,
      image_url,
      amount_raised: 0,
      status: "pending",
      creatorEmail: creatorEmail.toLowerCase(),
      creatorName,
      createdAt: new Date(),
    };

    const result = await db.collection("campaigns").insertOne(newCampaign);

    // Notify all admins of the new pending campaign
    try {
      await db.collection("notifications").insertOne({
        message: `New campaign "${title}" submitted by ${creatorName} is pending approval.`,
        isAdmin: true,
        readBy: [],
        actionRoute: "/dashboard?tab=campaigns",
        category: "campaigns",
        time: new Date(),
      });
    } catch (notifErr) {
      console.error("Failed to generate admin notification for new campaign:", notifErr);
    }

    return NextResponse.json(
      {
        message: "Campaign added successfully! It is pending approval by the Administrator.",
        campaignId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Campaigns Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT: Update campaign (title, story, rewards, or status)
export async function PUT(req) {
  try {
    const { id, title, story, reward_info, status } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required for updates." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const updateFields = {};

    if (status) {
      if (status !== "approved" && status !== "rejected" && status !== "pending") {
        return NextResponse.json({ error: "Invalid status code." }, { status: 400 });
      }
      updateFields.status = status;
    } else {
      if (!title || !story || !reward_info) {
        return NextResponse.json(
          { error: "Missing required fields for update." },
          { status: 400 }
        );
      }
      updateFields.title = title;
      updateFields.story = story;
      updateFields.reward_info = reward_info;
    }

    updateFields.updatedAt = new Date();

    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(id) });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    const result = await db.collection("campaigns").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Campaign not found." },
        { status: 404 }
      );
    }

    if (status) {
      try {
        await db.collection("notifications").insertOne({
          message: `Your campaign "${campaign.title}" has been ${status} by the Administrator.`,
          toEmail: campaign.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=my-campaigns",
          category: "campaigns",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Failed to generate creator notification:", notifErr);
      }
    }

    return NextResponse.json({ message: "Campaign updated successfully!" });
  } catch (error) {
    console.error("PUT Campaigns Error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign." },
      { status: 500 }
    );
  }
}

// DELETE: Delete campaign and refund any approved/pending contributions
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required for deletion." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const campaignOid = new ObjectId(id);

    // Fetch the campaign details to get title/information
    const campaign = await db.collection("campaigns").findOne({ _id: campaignOid });
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found." },
        { status: 404 }
      );
    }

    // refund approved & pending backer contributions
    // Find all contributions related to this campaign title or ID
    const contributions = await db
      .collection("contributions")
      .find({ campaignId: id })
      .toArray();

    // Iterate contributions and refund supporters
    for (const contribution of contributions) {
      // Only refund approved contributions (or pending if credits were already deducted)
      // Since credits are deducted immediately upon contribution, we refund both
      const refundAmount = Number(contribution.amount);
      if (refundAmount > 0) {
        await db.collection("users").updateOne(
          { email: contribution.supporterEmail.toLowerCase() },
          { $inc: { credits: refundAmount } }
        );
      }
    }

    // Delete contributions related to this campaign
    await db.collection("contributions").deleteMany({ campaignId: id });

    // Delete the campaign
    await db.collection("campaigns").deleteOne({ _id: campaignOid });

    return NextResponse.json({
      message: "Campaign deleted and backer contributions successfully refunded!",
    });
  } catch (error) {
    console.error("DELETE Campaign Error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign and process refunds." },
      { status: 500 }
    );
  }
}
