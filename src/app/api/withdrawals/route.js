import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Next.js to never cache this route — withdrawal requests change frequently
export const dynamic = "force-dynamic";

// GET: Fetch withdrawals (Creator history or Admin queue)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorEmail = searchParams.get("creatorEmail");

    const { db } = await connectToDatabase();
    let query = {};
    if (creatorEmail) {
      query.creatorEmail = creatorEmail.toLowerCase();
    }

    const withdrawals = await db
      .collection("withdrawals")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error("GET Withdrawals Error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals." }, { status: 500 });
  }
}

// POST: Creator requests a withdrawal (credits are locked immediately)
export async function POST(req) {
  try {
    const { creatorEmail, creatorName, withdrawal_credit, payment_system, account_number } = await req.json();

    if (!creatorEmail || !creatorName || !withdrawal_credit || !payment_system || !account_number) {
      return NextResponse.json({ error: "Missing required withdrawal details." }, { status: 400 });
    }

    const creditsToWithdraw = Number(withdrawal_credit);
    if (creditsToWithdraw < 200) {
      return NextResponse.json({ error: "Minimum withdrawal limit is 200 credits ($10)." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Verify creator exists and has enough credits
    const creator = await db.collection("users").findOne({ email: creatorEmail.toLowerCase() });
    if (!creator || creator.credits < creditsToWithdraw) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 400 });
    }

    // Deduct credits immediately from Creator
    await db.collection("users").updateOne(
      { email: creatorEmail.toLowerCase() },
      { $inc: { credits: -creditsToWithdraw } }
    );

    const dollarAmount = creditsToWithdraw / 20;

    const newWithdrawal = {
      creatorEmail: creatorEmail.toLowerCase(),
      creatorName,
      withdrawal_credit: creditsToWithdraw,
      withdrawal_amount: dollarAmount,
      payment_system,
      account_number,
      status: "pending",
      date: new Date(),
    };

    await db.collection("withdrawals").insertOne(newWithdrawal);

    // Notify admins of new withdrawal request
    try {
      await db.collection("notifications").insertOne({
        message: `New withdrawal request of ${creditsToWithdraw} credits submitted by ${creatorName}.`,
        isAdmin: true,
        readBy: [],
        actionRoute: "/dashboard?tab=withdrawals",
        category: "withdrawals",
        time: new Date(),
      });
    } catch (notifErr) {
      console.error("Failed to generate admin notification for withdrawal:", notifErr);
    }

    return NextResponse.json({ message: "Withdrawal request submitted successfully!" }, { status: 201 });
  } catch (error) {
    console.error("POST Withdrawal Error:", error);
    return NextResponse.json({ error: "Failed to submit withdrawal request." }, { status: 500 });
  }
}

// PUT: Admin approves or rejects a withdrawal request
export async function PUT(req) {
  try {
    const { withdrawalId, action } = await req.json();

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing withdrawal ID or action." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const oid = new ObjectId(withdrawalId);

    const withdrawal = await db.collection("withdrawals").findOne({ _id: oid });
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found." }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Withdrawal request already processed." }, { status: 400 });
    }

    if (action === "approve") {
      await db.collection("withdrawals").updateOne(
        { _id: oid },
        { $set: { status: "approved", processedAt: new Date() } }
      );

      // Notify Creator of withdrawal approval
      try {
        await db.collection("notifications").insertOne({
          message: `Your withdrawal request of ${withdrawal.withdrawal_credit} credits ($${withdrawal.withdrawal_amount}) was approved!`,
          toEmail: withdrawal.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=withdrawals",
          category: "withdrawals",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Failed to generate creator notification for withdrawal approval:", notifErr);
      }

      return NextResponse.json({ message: "Withdrawal request approved successfully!" });
    }

    if (action === "reject") {
      // 1. Mark rejected
      await db.collection("withdrawals").updateOne(
        { _id: oid },
        { $set: { status: "rejected", processedAt: new Date() } }
      );

      // 2. Refund credits back to Creator
      await db.collection("users").updateOne(
        { email: withdrawal.creatorEmail.toLowerCase() },
        { $inc: { credits: withdrawal.withdrawal_credit } }
      );

      // 3. Notify Creator of withdrawal rejection
      try {
        await db.collection("notifications").insertOne({
          message: `Your withdrawal request of ${withdrawal.withdrawal_credit} credits was rejected. Credits have been refunded to your balance.`,
          toEmail: withdrawal.creatorEmail.toLowerCase(),
          actionRoute: "/dashboard?tab=withdrawals",
          category: "withdrawals",
          time: new Date(),
          read: false,
        });
      } catch (notifErr) {
        console.error("Failed to generate creator notification for withdrawal rejection:", notifErr);
      }

      return NextResponse.json({ message: "Withdrawal request rejected and credits refunded." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("PUT Withdrawal Error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal." }, { status: 500 });
  }
}
