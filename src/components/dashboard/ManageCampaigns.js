"use client";

import React, { useEffect, useState } from "react";

export default function ManageCampaigns({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load campaigns.");
      
      // Filter for only pending campaigns for the approval queue
      const pending = data.filter((c) => c.status === "pending" || !c.status);
      setCampaigns(pending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAction = async (campaignId, action) => {
    setError("");
    setSuccess("");
    setProcessingId(campaignId);

    try {
      const res = await fetch("/api/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId,
          status: action === "approve" ? "approved" : "rejected",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update campaign status.");

      setSuccess(`Campaign successfully ${action === "approve" ? "approved" : "rejected"}!`);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Platform Controls
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Manage Campaigns
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review pending campaign requests submitted by creators. Approved campaigns will immediately show up for supporters to back.
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

      {campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">Queue Empty</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            There are no campaigns awaiting admin review at this moment.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Cover</th>
                  <th className="px-6 py-4 font-extrabold">Campaign details</th>
                  <th className="px-6 py-4 font-extrabold">Funding Goal</th>
                  <th className="px-6 py-4 font-extrabold">Creator details</th>
                  <th className="px-6 py-4 font-extrabold">Status</th>
                  <th className="px-6 py-4 font-extrabold">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {campaigns.map((camp) => (
                  <tr key={camp._id || camp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={camp.image_url}
                        alt={camp.title}
                        className="w-16 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-white max-w-xs truncate" title={camp.title}>
                        {camp.title}
                      </div>
                      <div className="text-xs text-zinc-500 capitalize">
                        {camp.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {camp.funding_goal} Credits
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-850 dark:text-zinc-300 text-xs">
                        {camp.creatorName}
                      </div>
                      <div className="text-3xs text-zinc-500">
                        {camp.creatorEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                        camp.status === "fulfilled"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : camp.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : camp.status === "rejected"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {camp.status === "fulfilled" ? "🎉 Fulfilled" : camp.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {processingId === (camp._id || camp.id) ? (
                        <span className="text-xs text-zinc-400 animate-pulse font-semibold">Processing...</span>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(camp._id || camp.id, "approve")}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(camp._id || camp.id, "reject")}
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
          </div>
        </div>
      )}

    </div>
  );
}
