import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

// GET: Retrieve all users (Admin view)
export async function GET(req) {
  try {
    const adminUser = getAuthUser(req);
    if (!adminUser || adminUser.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 }) // Exclude password hash
      .toArray();
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

// PUT: Update user role or status (Admin action)
export async function PUT(req) {
  try {
    const adminUser = getAuthUser(req);
    if (!adminUser || adminUser.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing user ID or role." }, { status: 400 });
    }

    if (role !== "Supporter" && role !== "Creator" && role !== "Admin") {
      return NextResponse.json({ error: "Invalid role value." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User role updated successfully!" });
  } catch (error) {
    console.error("PUT User Error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
