import HeroSlider from "@/components/HeroSlider";
import CampaignCard from "@/components/CampaignCard";
import Testimonials from "@/components/Testimonials";
import PlatformStats from "@/components/PlatformStats";
import ExploreByCategory from "@/components/ExploreByCategory";
import HowItWorks from "@/components/HowItWorks";
import { connectToDatabase } from "@/lib/mongodb";

export default async function Home() {
  let campaigns = [];
  let isDbConnected = false;

  try {
    const { db } = await connectToDatabase();
    isDbConnected = true;
    
    // Retrieve campaigns from database
    campaigns = await db.collection("campaigns").find({}).toArray();
  } catch (error) {
    console.error("MongoDB connection failed or timed out:", error.message);
  }

  // Sanitize MongoDB document objects (like _id ObjectIds) to plain JSON values before passing to Client Components
  const serializedCampaigns = JSON.parse(JSON.stringify(campaigns));

  // Map custom_id/id and sort campaigns by amount_raised in descending order, slice top 6
  const topCampaigns = serializedCampaigns
    .map((campaign) => ({
      ...campaign,
      id: campaign.custom_id || campaign.id || campaign._id,
    }))
    .sort((a, b) => b.amount_raised - a.amount_raised)
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Platform Impact Stats Section */}
      <PlatformStats />

      {/* Top Funded Campaigns Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Top Funded Campaigns
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Discover the most supported projects, causes, and ideas on our platform. Back them and help them succeed.
            </p>
            
            {/* DB status indicator (Subtle badge helper) */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold ${
                isDbConnected 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isDbConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                {isDbConnected ? "Live Database Connection" : "Offline Mode (Mock Data)"}
              </span>
            </div>
            <div className="mt-4 h-1 w-20 bg-emerald-500 rounded-full mx-auto" />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore By Category Section */}
      <ExploreByCategory />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}
