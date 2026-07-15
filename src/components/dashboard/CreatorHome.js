"use client";

import React, { useEffect, useState } from "react";

export default function CreatorHome({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchCreatorOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const [resCamps, resConts] = await Promise.all([
        fetch(`/api/campaigns?email=${user.email}`),
        fetch(`/api/contributions?creatorEmail=${user.email}`),
      ]);

      if (!resCamps.ok || !resConts.ok) {
        throw new Error("Failed to load Creator overview details.");
      }

      const campsData = await resCamps.json();
      const contsData = await resConts.json();

      setCampaigns(campsData);
      setContributions(contsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchCreatorOverview();
    }
  }, [user?.email]);

  const handlePledgeAction = async (contributionId, action) => {
    setError("");
    setSuccess("");
    setProcessingId(contributionId);

    try {
      const res = await fetch("/api/contributions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributionId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process pledge request.");

      setSuccess(`Pledge successfully ${action === "approve" ? "approved and credits added" : "rejected and refunded"}!`);
      fetchCreatorOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Calculations
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => new Date(c.deadline) > new Date()
  ).length;
  const totalRaised = campaigns.reduce((acc, curr) => acc + (curr.amount_raised || 0), 0);

  // Filter pending contributions to review
  const pendingPledges = contributions.filter((c) => c.status === "pending");

  const stats = [
    {
      label: "Campaigns Launched",
      value: `${totalCampaigns} Projects`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3.75m-18 0A2.25 2.25 0 005.25 12h13.5A2.25 2.25 0 0021 9.75m-18 0V18A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18V9.75" />
        </svg>
      ),
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Active Campaigns",
      value: `${activeCampaigns} Active`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      ),
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Total Raised",
      value: `${totalRaised} Credits`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-305">
      
      {/* Welcome Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Creator Portal
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Hello, {user?.name || "Creator"}!
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome to your Creator Workspace. Post campaigns, manage supporters, and track raises.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
          {success}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                {stat.value}
              </span>
            </div>
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Pledges to Review */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Recent Pledges to Review
          </h3>
          <span className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">
            Action required
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {pendingPledges.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No pending supporter pledges awaiting review.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Supporter</th>
                  <th className="px-6 py-4 font-extrabold">Campaign Target</th>
                  <th className="px-6 py-4 font-extrabold">Amount Pledged</th>
                  <th className="px-6 py-4 font-extrabold">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {pendingPledges.map((pledge) => (
                  <tr key={pledge._id || pledge.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-zinc-900 dark:text-white">{pledge.supporterName}</div>
                      <div className="text-3xs text-zinc-500">{pledge.supporterEmail}</div>
                    </td>
                    <td className="px-6 py-4.5 font-medium">
                      {pledge.campaignTitle}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {pledge.amount} Credits
                    </td>
                    <td className="px-6 py-4.5">
                      {processingId === (pledge._id || pledge.id) ? (
                        <span className="text-xs text-zinc-400 animate-pulse font-semibold">Processing...</span>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePledgeAction(pledge._id || pledge.id, "approve")}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePledgeAction(pledge._id || pledge.id, "reject")}
                            className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
