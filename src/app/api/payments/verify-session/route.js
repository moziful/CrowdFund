import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("WARNING: STRIPE_SECRET_KEY is not defined in environment variables.");
}
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function GET(req) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe API key is missing. Please set STRIPE_SECRET_KEY in your env file." },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if session has already been processed and claimed
    const existingPayment = await db.collection("payments").findOne({ sessionId });
    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: "Payment has already been processed.",
        alreadyProcessed: true,
        creditsPurchased: existingPayment.creditsPurchased,
      });
    }

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Transaction has not been completed." }, { status: 400 });
    }

    const email = session.metadata.email;
    const creditsPurchased = Number(session.metadata.credits);
    const amountDollars = Number(session.metadata.price);
    const cardBrand = session.payment_method_types?.[0] || "card";

    // 1. Create transaction record
    const newPayment = {
      sessionId,
      email: email.toLowerCase(),
      amountDollars,
      creditsPurchased,
      cardLast4: "Stripe Checkout",
      cardBrand,
      date: new Date(),
      status: "succeeded",
    };

    await db.collection("payments").insertOne(newPayment);

    // 2. Increment backer credits in DB
    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $inc: { credits: creditsPurchased } }
    );

    // CHALLENGE: Create notification for Supporter
    await db.collection("notifications").insertOne({
      message: `Your payment of $${amountDollars} was verified. Added ${creditsPurchased} credits to your account!`,
      toEmail: email.toLowerCase(),
      actionRoute: "/dashboard",
      time: new Date(),
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully verified and purchased ${creditsPurchased} credits!`,
      creditsPurchased,
    });
  } catch (error) {
    console.error("Verify Stripe Session Error:", error);
    return NextResponse.json({ error: "Failed to verify transaction." }, { status: 500 });
  }
}
