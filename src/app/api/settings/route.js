import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Retrieve platform settings (e.g., platform fee)
export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch settings document
    let config = await db.collection("system_settings").findOne({ _id: "platform_config" });
    
    if (!config) {
      // Initialize with default values if not exists
      const defaultConfig = {
        _id: "platform_config",
        platform_fee_usd: 5.0, // default $5 USD
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection("system_settings").insertOne(defaultConfig);
      config = defaultConfig;
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch platform settings." }, { status: 500 });
  }
}

// PUT: Update platform settings (Admin only)
export async function PUT(req) {
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
    const { platform_fee_usd } = await req.json();

    if (platform_fee_usd === undefined || isNaN(Number(platform_fee_usd)) || Number(platform_fee_usd) < 0) {
      return NextResponse.json({ error: "Invalid platform fee amount." }, { status: 400 });
    }

    await db.collection("system_settings").updateOne(
      { _id: "platform_config" },
      {
        $set: {
          platform_fee_usd: Number(platform_fee_usd),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Platform settings updated successfully!" });
  } catch (error) {
    console.error("PUT Settings Error:", error);
    return NextResponse.json({ error: "Failed to update platform settings." }, { status: 500 });
  }
}
