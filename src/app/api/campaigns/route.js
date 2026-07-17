import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

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
      if (
        status !== "approved" &&
        status !== "rejected" &&
        status !== "pending" &&
        status !== "suspended" &&
        status !== "fulfilled"
      ) {
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

// DELETE: Delete campaign and refund any approved/pending contributions based on role rules
export async function DELETE(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

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

    // Retrieve contributions related to this campaign ID
    const contributions = await db
      .collection("contributions")
      .find({ campaignId: id })
      .toArray();

    // Determine role of the user deleting the campaign
    const isCreator = user.email.toLowerCase() === campaign.creatorEmail.toLowerCase();
    const isAdmin = user.role?.toLowerCase() === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Access denied. Only the campaign creator or an admin can delete it." }, { status: 403 });
    }

    if (isCreator) {
      // Rule 1: Creator Deletes
      // All contributions are fully refunded to the supporters.
      // The total refunded amount is deducted from the creator's credits balance (can go negative).
      let totalRefund = 0;

      for (const contribution of contributions) {
        const refundAmount = Number(contribution.amount);
        if (refundAmount > 0) {
          totalRefund += refundAmount;
          await db.collection("users").updateOne(
            { email: contribution.supporterEmail.toLowerCase() },
            { $inc: { credits: refundAmount } }
          );

          // Notify Supporter
          try {
            await db.collection("notifications").insertOne({
              message: `The campaign "${campaign.title}" was deleted by the creator. Your pledge of ${refundAmount} credits has been fully refunded.`,
              toEmail: contribution.supporterEmail.toLowerCase(),
              actionRoute: "/dashboard?tab=contributions",
              category: "contributions",
              time: new Date(),
              read: false,
            });
          } catch (err) {
            console.error("Failed supporter deletion notification:", err);
          }
        }
      }

      // Deduct total refund from creator's credits balance (can go negative)
      await db.collection("users").updateOne(
        { email: campaign.creatorEmail.toLowerCase() },
        { $inc: { credits: -totalRefund } }
      );

      // Notify Creator
      try {
        await db.collection("notifications").insertOne({
          message: `Your campaign "${campaign.title}" was deleted. Refunded ${totalRefund} credits to supporters, which was deducted from your withdrawable balance.`,
          toEmail: campaign.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=my-campaigns",
          category: "campaigns",
          time: new Date(),
          read: false,
        });
      } catch (err) {
        console.error("Failed creator deletion notification:", err);
      }

    } else if (isAdmin) {
      // Rule 2: Admin Deletes
      // Both creator and admin get $1 (20 credits) each, rest refunded to supporters with deduction shared proportionally.
      const totalCredits = contributions.reduce((acc, curr) => acc + Number(curr.amount), 0);

      let creatorCut = 0;
      let platformCut = 0;

      if (totalCredits <= 40) {
        // Less than or equal to $2/40 credits: split equally, supporters get 0 refund
        creatorCut = Math.round(totalCredits / 2);
        platformCut = totalCredits - creatorCut;
      } else {
        // More than $2/40 credits: Creator gets 20 credits, Admin gets 20 credits
        creatorCut = 20;
        platformCut = 20;

        // Refund rest to supporters with proportional deduction
        const deductionRatio = 40 / totalCredits;

        for (const contribution of contributions) {
          const originalAmount = Number(contribution.amount);
          const deduction = originalAmount * deductionRatio;
          const refundAmount = Math.max(0, Math.floor(originalAmount - deduction));

          if (refundAmount > 0) {
            await db.collection("users").updateOne(
              { email: contribution.supporterEmail.toLowerCase() },
              { $inc: { credits: refundAmount } }
            );

            // Notify Supporter
            try {
              await db.collection("notifications").insertOne({
                message: `The campaign "${campaign.title}" was deleted by an Administrator. You received a partial refund of ${refundAmount} credits (Original: ${originalAmount} CR).`,
                toEmail: contribution.supporterEmail.toLowerCase(),
                actionRoute: "/dashboard?tab=contributions",
                category: "contributions",
                time: new Date(),
                read: false,
              });
            } catch (err) {
              console.error("Failed supporter admin deletion notification:", err);
            }
          }
        }
      }

      // Add cut to Creator balance
      await db.collection("users").updateOne(
        { email: campaign.creatorEmail.toLowerCase() },
        { $inc: { credits: creatorCut } }
      );

      // Add platform fee cut to revenue records
      if (platformCut > 0) {
        const revenueRecord = {
          campaignId: id,
          campaignTitle: campaign.title,
          creatorEmail: campaign.creatorEmail.toLowerCase(),
          creatorName: campaign.creatorName,
          total_credits: totalCredits,
          fee_deducted_credits: platformCut,
          fee_deducted_usd: platformCut / 20,
          net_credits_added: creatorCut,
          date: new Date(),
          type: "admin_deletion"
        };
        await db.collection("revenue_records").insertOne(revenueRecord);
      }

      // Notify Creator
      try {
        await db.collection("notifications").insertOne({
          message: `Your campaign "${campaign.title}" was deleted by an Administrator. You received ${creatorCut} credits ($${(creatorCut/20).toFixed(2)}) from the split, and remaining was refunded to supporters.`,
          toEmail: campaign.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=my-campaigns",
          category: "campaigns",
          time: new Date(),
          read: false,
        });
      } catch (err) {
        console.error("Failed creator admin deletion notification:", err);
      }

      // Notify Admin
      try {
        await db.collection("notifications").insertOne({
          message: `Admin deleted campaign "${campaign.title}". Platform earned $${(platformCut/20).toFixed(2)} (20 credits to creator, 20 to platform).`,
          isAdmin: true,
          readBy: [],
          actionRoute: "/dashboard?tab=revenue",
          category: "revenue",
          time: new Date(),
        });
      } catch (err) {
        console.error("Failed admin deletion notification:", err);
      }
    }

    // Delete contributions related to this campaign
    await db.collection("contributions").deleteMany({ campaignId: id });

    // Delete the campaign
    await db.collection("campaigns").deleteOne({ _id: campaignOid });

    return NextResponse.json({
      message: "Campaign successfully deleted, funds processed, and all respected parties notified.",
    });
  } catch (error) {
    console.error("DELETE Campaign Error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign and process refunds." },
      { status: 500 }
    );
  }
}
