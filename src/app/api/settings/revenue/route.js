import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve all revenue records (Admin only)
export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const dbUser = await db.collection("users").findOne({ email: authUser.email.toLowerCase() });
    if (!dbUser || (dbUser.role !== "Admin" && dbUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 403 });
    }
    const records = await db
      .collection("revenue_records")
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET Revenue Error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue records." }, { status: 500 });
  }
}
