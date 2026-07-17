import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("WARNING: STRIPE_SECRET_KEY is not defined in environment variables.");
}
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(req) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe API key is missing. Please set STRIPE_SECRET_KEY in your env file." },
        { status: 500 }
      );
    }
    const { email, creditsPurchased, amountDollars } = await req.json();

    if (!email || !creditsPurchased || !amountDollars) {
      return NextResponse.json(
        { error: "Missing required checkout parameters." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditsPurchased} CrowdFund Credits`,
              description: `Purchase credits to support campaign causes.`,
            },
            unit_amount: Math.round(Number(amountDollars) * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}&credits=${creditsPurchased}&price=${amountDollars}`,
      cancel_url: `${origin}/dashboard?payment_cancel=true`,
      metadata: {
        email: email.toLowerCase(),
        credits: String(creditsPurchased),
        price: String(amountDollars),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Create Checkout Session Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Stripe checkout session." },
      { status: 500 }
    );
  }
}
