import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function PUT(req) {
  try {
    const { email, name, avatarUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("users").findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { name, avatarUrl, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    // MongoDB Node driver v6+ returnDocument returns { value: doc } or direct doc depending on version, let's normalize:
    const updatedUser = result.value || result;

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Exclude password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: "Profile updated successfully!",
      user: {
        id: userWithoutPassword._id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        avatarUrl: userWithoutPassword.avatarUrl,
        role: userWithoutPassword.role,
        credits: userWithoutPassword.credits,
      },
    });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile settings." }, { status: 500 });
  }
}
