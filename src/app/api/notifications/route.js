import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

// Force Next.js to never cache this route — notifications change in real time
export const dynamic = "force-dynamic";

// GET: Fetch notifications for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required." }, { status: 400 });
    }

    // Replace URL-decoded spaces back to plus signs
    email = email.replace(/ /g, "+").toLowerCase();

    // 1. Authenticate caller using token
    const currentUser = getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    // 2. Enforce authorization: Must be querying own notifications or be an Admin
    const isCallerAdmin = 
      currentUser.role?.toLowerCase() === "admin" || 
      currentUser.email.toLowerCase() === "admin@crowd.com" || 
      currentUser.email.toLowerCase() === "mhmoni2310+@gmail.com";

    const isTargetingSelf = currentUser.email.toLowerCase() === email;

    if (!isTargetingSelf && !isCallerAdmin) {
      return NextResponse.json({ error: "Forbidden. Access denied." }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    // 3. Fetch notifications matching criteria
    const query = isCallerAdmin
      ? { $or: [{ toEmail: email }, { isAdmin: true }] }
      : { toEmail: email };

    const rawNotifications = await db
      .collection("notifications")
      .find(query)
      .sort({ time: -1 })
      .limit(30)
      .toArray();

    // 3. Map notifications to project local read status for Admin users dynamically
    const notifications = rawNotifications.map((notif) => {
      if (notif.isAdmin) {
        return {
          ...notif,
          read: notif.readBy?.includes(email.toLowerCase()) || false,
        };
      }
      return notif;
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

// POST: Create a new notification (supports toEmail or isAdmin: true)
export async function POST(req) {
  try {
    const { message, toEmail, isAdmin, category, actionRoute } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (!toEmail && !isAdmin) {
      return NextResponse.json({ error: "Either toEmail or isAdmin: true is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const newNotification = {
      message,
      category,
      actionRoute: actionRoute || "/dashboard",
      time: new Date(),
    };

    if (isAdmin) {
      newNotification.isAdmin = true;
      newNotification.readBy = [];
    } else {
      newNotification.toEmail = toEmail.toLowerCase();
      newNotification.read = false;
    }

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

    if (!email) {
      return NextResponse.json({ error: "Email is required to verify read state." }, { status: 400 });
    }

    // 1. Authenticate caller using token
    const currentUser = getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    // 2. Enforce authorization: Must be modifying own read states or be an Admin
    const isCallerAdmin = 
      currentUser.role?.toLowerCase() === "admin" || 
      currentUser.email.toLowerCase() === "admin@crowd.com" || 
      currentUser.email.toLowerCase() === "mhmoni2310+@gmail.com";

    const isTargetingSelf = currentUser.email.toLowerCase() === email.toLowerCase();

    if (!isTargetingSelf && !isCallerAdmin) {
      return NextResponse.json({ error: "Forbidden. Access denied." }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    if (markAll) {
      // 1. Mark standard user notifications as read
      await db.collection("notifications").updateMany(
        { toEmail: email.toLowerCase(), read: false },
        { $set: { read: true } }
      );

      // 2. If caller is admin, add email to readBy array for all admin notifications
      if (isCallerAdmin) {
        await db.collection("notifications").updateMany(
          { isAdmin: true },
          { $addToSet: { readBy: email.toLowerCase() } }
        );
      }

      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      const notif = await db.collection("notifications").findOne({ _id: new ObjectId(notificationId) });
      if (!notif) {
        return NextResponse.json({ error: "Notification not found." }, { status: 404 });
      }

      if (notif.isAdmin) {
        // Add specific admin's email to the readBy array
        await db.collection("notifications").updateOne(
          { _id: new ObjectId(notificationId) },
          { $addToSet: { readBy: email.toLowerCase() } }
        );
      } else {
        // Set standard notification as read
        await db.collection("notifications").updateOne(
          { _id: new ObjectId(notificationId) },
          { $set: { read: true } }
        );
      }

      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "Provide notificationId or markAll parameter." }, { status: 400 });
  } catch (error) {
    console.error("PUT Notification Error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}
