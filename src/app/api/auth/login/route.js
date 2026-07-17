import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

// Verify hashed password using crypto PBKDF2 helper
function verifyPassword(password, storedPassword) {
  try {
    const [salt, originalHash] = storedPassword.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch (e) {
    return false;
  }
}

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
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find user by email
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
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

    // Remove hashed password before returning response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        message: "Login successful.",
        token,
        user: {
          id: userWithoutPassword._id,
          name: userWithoutPassword.name,
          email: userWithoutPassword.email,
          avatarUrl: userWithoutPassword.avatarUrl,
          role: userWithoutPassword.role,
          credits: userWithoutPassword.credits,
        },
      },
      { status: 200 }
    );

    response.cookies.set("crowd_token", token, {
      httpOnly: false, // Let frontend confirm/read/delete it easily
      path: "/",
      maxAge: 604800, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
