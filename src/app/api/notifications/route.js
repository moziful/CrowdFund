import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch notifications for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const notifications = await db
      .collection("notifications")
      .find({ toEmail: email.toLowerCase() })
      .sort({ time: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

// POST: Create a new notification
export async function POST(req) {
  try {
    const { message, toEmail, actionRoute } = await req.json();

    if (!message || !toEmail) {
      return NextResponse.json({ error: "Message and toEmail are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const newNotification = {
      message,
      toEmail: toEmail.toLowerCase(),
      actionRoute: actionRoute || "/dashboard",
      time: new Date(),
      read: false,
    };

    await db.collection("notifications").insertOne(newNotification);

    return NextResponse.json({ success: true, notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error("POST Notification Error:", error);
    return NextResponse.json({ error: "Failed to create notification." }, { status: 500 });
  }
}

// PUT: Mark notification(s) as read
export async function PUT(req) {
  try {
    const { notificationId, email, markAll } = await req.json();

    const { db } = await connectToDatabase();

    if (markAll && email) {
      // Mark all notifications as read for a user
      await db.collection("notifications").updateMany(
        { toEmail: email.toLowerCase(), read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      // Mark a single notification as read
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "Provide notificationId or email with markAll." }, { status: 400 });
  } catch (error) {
    console.error("PUT Notification Error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}
