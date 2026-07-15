"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SupporterHome from "@/components/dashboard/SupporterHome";
import CreatorHome from "@/components/dashboard/CreatorHome";
import AdminHome from "@/components/dashboard/AdminHome";
import AddCampaign from "@/components/dashboard/AddCampaign";
import MyCampaigns from "@/components/dashboard/MyCampaigns";
import MyContributions from "@/components/dashboard/MyContributions";
import PurchaseCredit from "@/components/dashboard/PurchaseCredit";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import Withdrawals from "@/components/dashboard/Withdrawals";
import CreatorHistory from "@/components/dashboard/CreatorHistory";
import ManageUsers from "@/components/dashboard/ManageUsers";
import ManageCampaigns from "@/components/dashboard/ManageCampaigns";
import WithdrawalRequests from "@/components/dashboard/WithdrawalRequests";
import Reports from "@/components/dashboard/Reports";

// Helper DashboardHeader Component matching auroralib style
function DashboardHeader({ roleTitle, subtitle, credits }) {
  return (
    <div className="mb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            {roleTitle.split(" ")[0]}{" "}
            <span className="text-emerald-500">
              {roleTitle.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Credits Badge */}
      <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 w-fit flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Available Credits
        </span>
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
          {credits ?? 0}
        </span>
      </div>
    </div>
  );
}

// Helper DashboardTabs Component matching auroralib style
function DashboardTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="space-y-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 border-l-2 px-4 py-3 text-left text-sm font-bold transition-all duration-150 hover:cursor-pointer ${
              isActive
                ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 hover:text-zinc-950 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  // Tabs configurations based on role
  const getTabsConfig = (role) => {
    // Unique SVG icons for each action
    const overviewIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    );

    const usersIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );

    const campaignsIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );

    const withdrawalsIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

    const reportsIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    );

    const addCampaignIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

    const historyIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

    const contributionsIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );

    const purchaseIcon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );

    if (role === "Admin") {
      return [
        { id: "overview", label: "Overview", icon: overviewIcon },
        { id: "users", label: "Manage Users", icon: usersIcon },
        { id: "campaigns", label: "Manage Campaigns", icon: campaignsIcon },
        { id: "withdrawals", label: "Withdrawal Requests", icon: withdrawalsIcon },
        { id: "reports", label: "Reports", icon: reportsIcon },
      ];
    } else if (role === "Creator") {
      return [
        { id: "overview", label: "Creator Home", icon: overviewIcon },
        { id: "add-campaign", label: "Add New Campaign", icon: addCampaignIcon },
        { id: "my-campaigns", label: "My Campaigns", icon: campaignsIcon },
        { id: "withdrawals", label: "Withdrawals", icon: withdrawalsIcon },
        { id: "history", label: "Payment History", icon: historyIcon },
      ];
    } else {
      return [
        { id: "overview", label: "Overview", icon: overviewIcon },
        { id: "contributions", label: "My Contributions", icon: contributionsIcon },
        { id: "purchase", label: "Purchase Credit", icon: purchaseIcon },
        { id: "history", label: "Payment History", icon: historyIcon },
      ];
    }
  };

  const tabs = getTabsConfig(user.role);

  // Render content depending on activeTab
  const renderTabContent = () => {
    if (activeTab === "overview") {
      if (user.role === "Admin") return <AdminHome user={user} />;
      if (user.role === "Creator") return <CreatorHome user={user} />;
      return <SupporterHome user={user} />;
    }

    if (activeTab === "add-campaign" && user.role === "Creator") {
      return <AddCampaign user={user} />;
    }

    if (activeTab === "my-campaigns" && user.role === "Creator") {
      return <MyCampaigns user={user} />;
    }

    // Supporter tabs routing
    if (activeTab === "contributions" && user.role === "Supporter") {
      return <MyContributions user={user} />;
    }
    if (activeTab === "purchase" && user.role === "Supporter") {
      return <PurchaseCredit user={user} />;
    }
    if (activeTab === "history" && user.role === "Supporter") {
      return <PaymentHistory user={user} />;
    }

    // Creator tabs routing
    if (activeTab === "withdrawals" && user.role === "Creator") {
      return <Withdrawals user={user} />;
    }
    if (activeTab === "history" && user.role === "Creator") {
      return <CreatorHistory user={user} />;
    }

    // Admin tabs routing
    if (activeTab === "users" && user.role === "Admin") {
      return <ManageUsers user={user} />;
    }
    if (activeTab === "campaigns" && user.role === "Admin") {
      return <ManageCampaigns user={user} />;
    }
    if (activeTab === "withdrawals" && user.role === "Admin") {
      return <WithdrawalRequests user={user} />;
    }
    if (activeTab === "reports" && user.role === "Admin") {
      return <Reports user={user} />;
    }

    // Default placeholder components for other tabs
    return (
      <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-white dark:bg-zinc-900">
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
          Workspace Panel
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This sub-section panel ({activeTab}) will display content options dynamically based on active databases.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* 1. Header component */}
      <DashboardHeader
        roleTitle={`${user.role} Dashboard`}
        subtitle={`Welcome back, ${user.name || "User"}`}
        credits={user.credits}
      />

      {/* 2. Responsive Layout Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr] items-start">
        
        {/* Mobile Horizontal Tabs Switcher */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-zinc-100 dark:border-zinc-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Left Sidebar Tab Switcher */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <DashboardTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </aside>

        {/* Right side Active Tab Content View */}
        <div className="w-full min-w-0">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
}
