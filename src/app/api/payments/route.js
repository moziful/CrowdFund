import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// Force Next.js to never cache this route — payment history changes frequently
export const dynamic = "force-dynamic";

// GET: Fetch payment history (purchases) by supporter
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const payments = await db
      .collection("payments")
      .find({ email: email.toLowerCase() })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET Payments Error:", error);
    return NextResponse.json({ error: "Failed to fetch payments." }, { status: 500 });
  }
}

// POST: Add new credit purchase (adds credits to user account)
export async function POST(req) {
  try {
    const { email, amountDollars, creditsPurchased, cardLast4 } = await req.json();

    if (!email || !amountDollars || !creditsPurchased) {
      return NextResponse.json({ error: "Missing purchase details." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Create transaction record
    const newPayment = {
      email: email.toLowerCase(),
      amountDollars: Number(amountDollars),
      creditsPurchased: Number(creditsPurchased),
      cardLast4: cardLast4 || "4242",
      date: new Date(),
      status: "succeeded",
    };

    await db.collection("payments").insertOne(newPayment);

    // 2. Increment backer credits
    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $inc: { credits: Number(creditsPurchased) } }
    );

    return NextResponse.json({
      message: `Successfully purchased ${creditsPurchased} credits for $${amountDollars}!`,
    });
  } catch (error) {
    console.error("POST Payment Error:", error);
    return NextResponse.json({ error: "Failed to process payment." }, { status: 500 });
  }
}
