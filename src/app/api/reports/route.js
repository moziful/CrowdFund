import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

// GET: Retrieve all reports (Admin only)
export async function GET(req) {
  try {
    const adminUser = getAuthUser(req);
    if (!adminUser || adminUser.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const reports = await db
      .collection("reports")
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET Reports Error:", error);
    return NextResponse.json({ error: "Failed to fetch reports." }, { status: 500 });
  }
}

// POST: Create a new report (Any authenticated user)
export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const { campaignId, campaignTitle, reason } = await req.json();

    if (!campaignId || !campaignTitle || !reason) {
      return NextResponse.json({ error: "Campaign details and reason are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const newReport = {
      reporter: user.name,
      email: user.email,
      target: campaignTitle,
      campaignId,
      reason,
      date: new Date(),
      status: "pending",
    };

    await db.collection("reports").insertOne(newReport);

    return NextResponse.json({ success: true, message: "Campaign reported successfully!" }, { status: 201 });
  } catch (error) {
    console.error("POST Report Error:", error);
    return NextResponse.json({ error: "Failed to file report." }, { status: 500 });
  }
}

// PUT: Resolve a report (Admin only)
export async function PUT(req) {
  try {
    const adminUser = getAuthUser(req);
    if (!adminUser || adminUser.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { reportId, status } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "Missing report ID or status." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("reports").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { status, resolvedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Report status updated successfully!" });
  } catch (error) {
    console.error("PUT Report Error:", error);
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }
}
