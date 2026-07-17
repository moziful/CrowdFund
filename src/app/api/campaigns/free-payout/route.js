import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve free payout requests (Admin only)
export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const requests = await db
      .collection("free_payout_requests")
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET Free Payouts Error:", error);
    return NextResponse.json({ error: "Failed to fetch free payout requests." }, { status: 500 });
  }
}

// POST: Submit a new free payout request (Creator only)
export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role?.toLowerCase() !== "creator") {
      return NextResponse.json({ error: "Unauthorized access. Creators only." }, { status: 403 });
    }

    const { campaignId, reason } = await req.json();
    if (!campaignId || !reason?.trim()) {
      return NextResponse.json({ error: "Campaign ID and reason are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (campaign.creatorEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied. You do not own this campaign." }, { status: 403 });
    }

    const unconverted = (campaign.amount_raised || 0) - (campaign.amount_converted || 0);
    if (unconverted <= 0) {
      return NextResponse.json({ error: "No unconverted credits available to request payout." }, { status: 400 });
    }

    // Check if there is already a pending request for this campaign
    const existingPending = await db.collection("free_payout_requests").findOne({
      campaignId,
      status: "pending"
    });

    if (existingPending) {
      return NextResponse.json({ error: "You already have a pending free payout request for this campaign." }, { status: 400 });
    }

    const request = {
      campaignId,
      campaignTitle: campaign.title,
      creatorEmail: campaign.creatorEmail.toLowerCase(),
      creatorName: campaign.creatorName,
      amount: unconverted,
      reason,
      status: "pending",
      date: new Date(),
    };

    await db.collection("free_payout_requests").insertOne(request);

    // Notify Admins
    try {
      await db.collection("notifications").insertOne({
        message: `New Free Payout request for "${campaign.title}" submitted by ${campaign.creatorName}.`,
        isAdmin: true,
        readBy: [],
        actionRoute: "/dashboard?tab=free-payouts",
        category: "withdrawals",
        time: new Date(),
      });
    } catch (notifErr) {
      console.error("Free payout notification error:", notifErr);
    }

    return NextResponse.json({ message: "Free payout request submitted successfully!" }, { status: 201 });
  } catch (error) {
    console.error("POST Free Payout Request Error:", error);
    return NextResponse.json({ error: "Failed to submit free payout request." }, { status: 500 });
  }
}

// PUT: Approve or reject free payout request (Admin only)
export async function PUT(req) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 403 });
    }

    const { requestId, action } = await req.json();
    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required." }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const reqOid = new ObjectId(requestId);
    const request = await db.collection("free_payout_requests").findOne({ _id: reqOid });

    if (!request) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "This request has already been processed." }, { status: 400 });
    }

    if (action === "approve") {
      // 1. Fetch current campaign details
      const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(request.campaignId) });
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found. Cannot process request." }, { status: 404 });
      }

      const raised = Number(campaign.amount_raised || 0);
      const converted = Number(campaign.amount_converted || 0);
      const unconverted = raised - converted;

      if (unconverted <= 0) {
        return NextResponse.json({ error: "No unconverted credits available on this campaign." }, { status: 400 });
      }

      // 2. Add ENTIRE unconverted credits to Creator balance (No fee deducted)
      await db.collection("users").updateOne(
        { email: campaign.creatorEmail.toLowerCase() },
        { $inc: { credits: unconverted } }
      );

      // 3. Mark credits as converted in campaign
      await db.collection("campaigns").updateOne(
        { _id: new ObjectId(request.campaignId) },
        { $set: { amount_converted: raised } }
      );

      // 4. Update request status
      await db.collection("free_payout_requests").updateOne(
        { _id: reqOid },
        { $set: { status: "approved", processedAt: new Date() } }
      );

      // 5. Notify Creator
      try {
        await db.collection("notifications").insertOne({
          message: `Your free payout request for "${campaign.title}" was approved! ${unconverted} credits added to your wallet (Fee waived).`,
          toEmail: campaign.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=my-campaigns",
          category: "campaigns",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Free payout approval notification error:", notifErr);
      }

      return NextResponse.json({ message: "Free payout request approved successfully!" });
    }

    if (action === "reject") {
      // 1. Fetch campaign details
      const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(request.campaignId) });
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found. Cannot process rejection." }, { status: 404 });
      }

      const raised = Number(campaign.amount_raised || 0);
      const converted = Number(campaign.amount_converted || 0);
      const unconverted = raised - converted;

      // Fetch platform fee settings
      let config = await db.collection("system_settings").findOne({ _id: "platform_config" });
      const feeUsd = config ? Number(config.platform_fee_usd) : 5.0;
      const feeCredits = feeUsd * 20;

      let msg = "";
      if (unconverted > feeCredits) {
        const netCredits = unconverted - feeCredits;

        // A. Add net credits to Creator balance
        await db.collection("users").updateOne(
          { email: campaign.creatorEmail.toLowerCase() },
          { $inc: { credits: netCredits } }
        );

        // B. Log platform revenue record
        const revenueRecord = {
          campaignId: request.campaignId,
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

        // C. Mark credits as converted in campaign
        await db.collection("campaigns").updateOne(
          { _id: new ObjectId(request.campaignId) },
          { $set: { amount_converted: raised } }
        );

        msg = `Your free payout request for "${campaign.title}" was rejected. Standard conversion was automatically performed: ${unconverted} credits converted, net ${netCredits} credits added to your wallet (Fee: ${feeCredits} CR).`;

        // Notify Admin of fee collection
        try {
          await db.collection("notifications").insertOne({
            message: `Waiver rejected for "${campaign.title}". Standard conversion processed automatically. Platform fee collected: $${feeUsd.toFixed(2)}.`,
            isAdmin: true,
            readBy: [],
            actionRoute: "/dashboard?tab=revenue",
            category: "revenue",
            time: new Date(),
          });
        } catch (e) {}
      } else {
        msg = `Your free payout request for "${campaign.title}" was rejected. The unconverted balance of ${unconverted} credits is too low to cover standard conversion fees (${feeCredits} credits), so no funds were converted.`;
      }

      // 2. Update request status
      await db.collection("free_payout_requests").updateOne(
        { _id: reqOid },
        { $set: { status: "rejected", processedAt: new Date() } }
      );

      // 3. Notify Creator
      try {
        await db.collection("notifications").insertOne({
          message: msg,
          toEmail: request.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=my-campaigns",
          category: "campaigns",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Free payout rejection notification error:", notifErr);
      }

      return NextResponse.json({ message: "Free payout request rejected and processed successfully." });
    }

  } catch (error) {
    console.error("PUT Free Payout Error:", error);
    return NextResponse.json({ error: "Failed to process free payout request." }, { status: 500 });
  }
}
