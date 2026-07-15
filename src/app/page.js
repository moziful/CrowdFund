import HeroSlider from "@/components/HeroSlider";
import CampaignCard from "@/components/CampaignCard";
import campaignsData from "@/data/campaigns.json";

export default function Home() {
  // Sort campaigns by amount_raised in descending order and select the top 6
  const topCampaigns = [...campaignsData]
    .sort((a, b) => b.amount_raised - a.amount_raised)
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Top Funded Campaigns Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Top Funded Campaigns
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Discover the most supported projects, causes, and ideas on our platform. Back them and help them succeed.
            </p>
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
    </div>
  );
}
