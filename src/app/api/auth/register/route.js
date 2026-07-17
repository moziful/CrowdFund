import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

// Secure password hashing helper using built-in PBKDF2
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(req) {
  try {
    const { name, email, avatarUrl, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields except avatar URL are required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email address." },
        { status: 400 }
      );
    }

    // Hash password using crypto helper
    const hashedPassword = hashPassword(password);

    // Assign default credit values
    const defaultCredits = role === "Creator" ? 20 : 50;

    const newUser = {
      name,
      email: email.toLowerCase(),
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      password: hashedPassword,
      role,
      credits: defaultCredits,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    // Notify admins of new user registration
    try {
      await db.collection("notifications").insertOne({
        message: `New user "${name}" registered as a ${role}.`,
        isAdmin: true,
        readBy: [],
        actionRoute: "/dashboard?tab=users",
        category: "users",
        time: new Date(),
      });
    } catch (notifErr) {
      console.error("Failed to generate admin notification for registration:", notifErr);
    }

    return NextResponse.json(
      { message: "Registration successful! You can now log in." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
