import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

// Generate fully compliant JWT using Node.js built-in crypto
function signToken(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(req) {
  try {
    const { credential, role } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential token is required." },
        { status: 400 }
      );
    }

    // Verify token with Google's tokeninfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      console.error("Google Token Verification Failed:", errorText);
      return NextResponse.json(
        { error: "Invalid Google credential token." },
        { status: 401 }
      );
    }

    const payload = await verifyRes.json();
    const clientId = process.env.CLIENT_ID;

    // Optional safety verification: check client ID matching
    if (clientId && payload.aud !== clientId) {
      console.error("Google Token audience mismatch:", payload.aud, "expected:", clientId);
      return NextResponse.json(
        { error: "Google credential audience mismatch." },
        { status: 401 }
      );
    }

    const email = payload.email?.toLowerCase();
    const name = payload.name;
    const avatarUrl = payload.picture;

    if (!email) {
      return NextResponse.json(
        { error: "Email address not returned by Google." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    let user = await db.collection("users").findOne({ email });

    if (!user) {
      // If user does not exist and no role is supplied, prompt frontend to pick role
      if (!role) {
        return NextResponse.json({
          exists: false,
          email,
          name,
          avatarUrl,
        });
      }

      // If role is supplied, register new user
      if (role !== "Supporter" && role !== "Creator") {
        return NextResponse.json(
          { error: "Invalid role selected." },
          { status: 400 }
        );
      }

      const defaultCredits = role === "Creator" ? 20 : 50;

      const newUser = {
        name,
        email,
        avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        role,
        credits: defaultCredits,
        createdAt: new Date(),
        googleUser: true,
      };

      const result = await db.collection("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };

      // Notify admins of new user registration
      try {
        await db.collection("notifications").insertOne({
          message: `New user "${name}" registered via Google as a ${role}.`,
          isAdmin: true,
          readBy: [],
          actionRoute: "/dashboard?tab=users",
          category: "users",
          time: new Date(),
        });
      } catch (notifErr) {
        console.error("Failed to generate admin notification for registration:", notifErr);
      }
    }

    // Generate JWT session token using crypto helper
    const token = signToken(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "default_jwt_secret_key_123"
    );

    const response = NextResponse.json(
      {
        message: "Google login successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          credits: user.credits,
        },
      },
      { status: 200 }
    );

    response.cookies.set("crowd_token", token, {
      httpOnly: false,
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error during Google login." },
      { status: 500 }
    );
  }
}
