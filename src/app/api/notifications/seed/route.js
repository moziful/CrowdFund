import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();

    const now = new Date();

    const sampleNotifications = [
      // Supporter Notifications
      {
        message: "Your payment of $20.00 was verified. Added 200 credits to your account!",
        toEmail: "supporter@crowd.com",
        read: false,
        time: new Date(now.getTime() - 47 * 60 * 1000), // 47 minutes ago
        category: "contributions",
        actionRoute: "/dashboard?tab=contributions",
      },
      {
        message: "Your pledge of 50 credits for Solar Water Pump Setup was approved by the creator!",
        toEmail: "supporter@crowd.com",
        read: true,
        time: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        category: "contributions",
        actionRoute: "/dashboard?tab=contributions",
      },

      // Creator Notifications
      {
        message: "New pledge of 200 credits submitted by Sam Supporter on your campaign 'Solar Water Pump Setup'.",
        toEmail: "creator@crowd.com",
        read: false,
        time: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        category: "contributions",
        actionRoute: "/dashboard?tab=overview",
      },
      {
        message: "Your campaign 'Solar Water Pump Setup' has been approved by the Administrator.",
        toEmail: "creator@crowd.com",
        read: true,
        time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        category: "campaigns",
        actionRoute: "/dashboard?tab=my-campaigns",
      },

      // Admin Notifications
      {
        message: "New security report filed by Sam Supporter on 'Reforestation App'.",
        isAdmin: true,
        readBy: [],
        time: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
        category: "reports",
        actionRoute: "/dashboard?tab=reports",
      },
      {
        message: "New campaign 'Solar Water Pump Setup' submitted by Chris Creator is pending approval.",
        isAdmin: true,
        readBy: ["otheradmin@crowd.com"], // Mark read for another admin, unread for current admin
        time: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        category: "campaigns",
        actionRoute: "/dashboard?tab=campaigns",
      },
    ];

    // Query existing pending campaigns in DB
    const pendingCampaigns = await db.collection("campaigns").find({ status: "pending" }).toArray();
    const campaignNotifications = pendingCampaigns.map((camp) => ({
      message: `New campaign "${camp.title}" submitted by ${camp.creatorName} is pending approval.`,
      isAdmin: true,
      readBy: [],
      time: camp.createdAt || new Date(),
      category: "campaigns",
      actionRoute: "/dashboard?tab=campaigns",
    }));

    // Query existing pending reports in DB
    const pendingReports = await db.collection("reports").find({ status: "pending" }).toArray();
    const reportNotifications = pendingReports.map((rep) => ({
      message: `New security report filed by ${rep.reporter} on "${rep.target}".`,
      isAdmin: true,
      readBy: [],
      time: rep.date || new Date(),
      category: "reports",
      actionRoute: "/dashboard?tab=reports",
    }));

    const finalNotifications = [
      ...sampleNotifications,
      ...campaignNotifications,
      ...reportNotifications,
    ];

    // Clear existing mock notifications to avoid clutter
    await db.collection("notifications").deleteMany({
      $or: [
        { toEmail: { $in: ["supporter@crowd.com", "creator@crowd.com", "admin@crowd.com"] } },
        { isAdmin: true }
      ]
    });

    // Insert all notifications
    await db.collection("notifications").insertMany(finalNotifications);

    return NextResponse.json({
      success: true,
      message: "Sample and database-audit notifications seeded successfully!",
      notificationsAdded: finalNotifications.length,
      dynamicCampaignAlerts: campaignNotifications.length,
      dynamicReportAlerts: reportNotifications.length,
    });
  } catch (error) {
    console.error("Seeding Notifications Error:", error);
    return NextResponse.json({ error: "Failed to seed sample notifications." }, { status: 500 });
  }
}
