"use client";

import React, { useEffect, useState } from "react";

export default function MyCampaigns({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit State
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    story: "",
    reward_info: "",
  });
  const [updating, setUpdating] = useState(false);

  // Fetch creator's campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns?email=${user.email}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load campaigns.");
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchCampaigns();
    }
  }, [user?.email]);

  // Handle Edit click
  const handleEditClick = (campaign) => {
    setEditingCampaign(campaign);
    setEditFormData({
      title: campaign.title,
      story: campaign.story,
      reward_info: campaign.reward_info,
    });
    setError("");
    setSuccess("");
  };

  // Submit edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCampaign._id || editingCampaign.id,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update campaign.");

      setSuccess(data.message);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle Delete
  const handleDelete = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This will remove the campaign and refund all contributor pledges!")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete campaign.");

      setSuccess(data.message);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
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
      
      {/* Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Campaign Portfolio
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          My Campaigns
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage, edit, or delete campaigns you have posted. Approved backers are refunded automatically on deletion.
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

      {/* Edit Panel (Conditional) */}
      {editingCampaign && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-4">
            Edit Campaign: <span className="text-emerald-500">{editingCampaign.title}</span>
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Story Story & Details
              </label>
              <textarea
                required
                rows={3}
                value={editFormData.story}
                onChange={(e) => setEditFormData({ ...editFormData, story: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Reward description
              </label>
              <textarea
                required
                rows={2}
                value={editFormData.reward_info}
                onChange={(e) => setEditFormData({ ...editFormData, reward_info: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 transition-colors"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Table */}
      {campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven't posted any campaigns yet.
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
                  <th className="px-6 py-4 font-extrabold">Goal & Raised</th>
                  <th className="px-6 py-4 font-extrabold">Deadline</th>
                  <th className="px-6 py-4 font-extrabold">Status</th>
                  <th className="px-6 py-4 font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {campaigns.map((camp) => {
                  const isPending = camp.status === "pending";
                  const deadlineDate = new Date(camp.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
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
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                          {camp.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-zinc-500">
                          Goal: <span className="font-bold text-zinc-700 dark:text-zinc-300">{camp.funding_goal} cr</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          Raised: <span className="font-bold text-emerald-600 dark:text-emerald-400">{camp.amount_raised ?? 0} cr</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {deadlineDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                          camp.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : camp.status === "rejected"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {camp.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => handleEditClick(camp)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(camp._id || camp.id)}
                            className="text-xs font-bold text-red-500 dark:text-red-450 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
