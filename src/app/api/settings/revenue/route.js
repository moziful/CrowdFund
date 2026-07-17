import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve all revenue records (Admin only)
export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 403 });
    }

    const { db } = await connectToDatabase();
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
