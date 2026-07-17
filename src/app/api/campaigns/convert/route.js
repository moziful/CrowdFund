import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Convert raised campaign credits to withdrawable balance
export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { campaignId } = await req.json();
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    // Verify ownership: User must be creator or Admin
    const isCreator = user.email.toLowerCase() === campaign.creatorEmail.toLowerCase();
    const isAdmin = user.role === "Admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Access denied. Only the campaign creator or an admin can convert funds." }, { status: 403 });
    }

    const raised = Number(campaign.amount_raised || 0);
    const converted = Number(campaign.amount_converted || 0);
    const unconverted = raised - converted;

    if (unconverted <= 0) {
      return NextResponse.json({ error: "No unconverted credits available on this campaign." }, { status: 400 });
    }

    // Fetch platform fee settings
    let config = await db.collection("system_settings").findOne({ _id: "platform_config" });
    const feeUsd = config ? Number(config.platform_fee_usd) : 5.0;
    const feeCredits = feeUsd * 20; // 20 credits = $1

    if (unconverted <= feeCredits) {
      return NextResponse.json({
        error: `Unconverted balance (${unconverted} credits) is less than or equal to the platform conversion fee of ${feeCredits} credits ($${feeUsd}). Consider requesting a Free Payout.`
      }, { status: 400 });
    }

    const netCredits = unconverted - feeCredits;

    // 1. Update creator's withdrawable balance
    await db.collection("users").updateOne(
      { email: campaign.creatorEmail.toLowerCase() },
      { $inc: { credits: netCredits } }
    );

    // 2. Log platform revenue record
    const revenueRecord = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      creatorEmail: campaign.creatorEmail.toLowerCase(),
      creatorName: campaign.creatorName,
      total_credits: unconverted,
      fee_deducted_credits: feeCredits,
      fee_deducted_usd: feeUsd,
      net_credits_added: netCredits,
      date: new Date(),
    };
    await db.collection("revenue_records").insertOne(revenueRecord);

    // 3. Mark credits as converted in the campaign
    await db.collection("campaigns").updateOne(
      { _id: new ObjectId(campaignId) },
      { $set: { amount_converted: raised } }
    );

    // 4. Notifications
    try {
      // Notify creator
      await db.collection("notifications").insertOne({
        message: `Converted ${unconverted} credits from "${campaign.title}". Net ${netCredits} credits added to your wallet (Fee: ${feeCredits} CR).`,
        toEmail: campaign.creatorEmail.toLowerCase(),
        actionRoute: "/dashboard?tab=my-campaigns",
        category: "campaigns",
        time: new Date(),
        read: false,
      });

      // Notify Admin
      await db.collection("notifications").insertOne({
        message: `Campaign "${campaign.title}" converted ${unconverted} credits. Platform fee revenue: $${feeUsd.toFixed(2)}.`,
        isAdmin: true,
        readBy: [],
        actionRoute: "/dashboard?tab=revenue",
        category: "revenue",
        time: new Date(),
      });
    } catch (notifErr) {
      console.error("Conversion notifications error:", notifErr);
    }

    return NextResponse.json({
      message: "Conversion successful!",
      unconverted,
      feeCredits,
      netCredits
    });
  } catch (error) {
    console.error("Convert Funds Route Error:", error);
    return NextResponse.json({ error: "Failed to convert funds." }, { status: 500 });
  }
}
