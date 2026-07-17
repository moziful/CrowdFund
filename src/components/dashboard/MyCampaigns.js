"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function MyCampaigns({ user, onTabChange }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inspect details modal state
  const [detailsCampaign, setDetailsCampaign] = useState(null);

  // Edit Campaign State
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    story: "",
    category: "",
    funding_goal: 0,
    deadline: "",
    reward_info: "",
    image_url: "",
  });
  const [updating, setUpdating] = useState(false);

  // Confirmations
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteCamp, setTargetDeleteCamp] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTempData, setEditTempData] = useState(null);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [targetConvertCamp, setTargetConvertCamp] = useState(null);
  const [converting, setConverting] = useState(false);

  const [freePayoutModalOpen, setFreePayoutModalOpen] = useState(false);
  const [targetFreeCamp, setTargetFreeCamp] = useState(null);
  const [freePayoutReason, setFreePayoutReason] = useState("");
  const [submittingFreePayout, setSubmittingFreePayout] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    setSuccess("");

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error("ImgBB API key is missing. Please check your environment variables.");
      }

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload cover image.");
      }

      setEditFormData((prev) => ({ ...prev, image_url: data.data.url }));
      setSuccess("Image uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns?creator=true");
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
    fetchCampaigns();
  }, []);

  // Delete Campaign
  const handleDeleteTrigger = (campaign) => {
    setTargetDeleteCamp(campaign);
    setDeleteModalOpen(true);
    setDetailsCampaign(null);
  };

  const handleDeleteConfirm = async () => {
    if (!targetDeleteCamp) return;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/campaigns?id=${targetDeleteCamp._id || targetDeleteCamp.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete campaign.");

      setSuccess("Campaign successfully deleted. Supporters have been refunded.");
      setDeleteModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Edit Click
  const handleEditClick = (campaign) => {
    setEditingCampaign(campaign);
    setEditFormData({
      title: campaign.title || "",
      story: campaign.story || "",
      category: campaign.category || "",
      funding_goal: Number(campaign.funding_goal || 0),
      deadline: campaign.deadline ? campaign.deadline.split("T")[0] : "",
      reward_info: campaign.reward_info || "",
      image_url: campaign.image_url || "",
    });
    setDetailsCampaign(null);
  };

  const handleEditPreSubmit = (e) => {
    e.preventDefault();
    setEditTempData(editFormData);
    setEditModalOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!editTempData || !editingCampaign) return;
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCampaign._id || editingCampaign.id,
          ...editTempData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update campaign.");

      setSuccess("Campaign details successfully updated.");
      setEditingCampaign(null);
      setEditModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Convert Funds
  const handleConvertTrigger = (campaign) => {
    setTargetConvertCamp(campaign);
    setConvertModalOpen(true);
    setDetailsCampaign(null);
  };

  const handleConvertConfirm = async () => {
    if (!targetConvertCamp) return;
    setConverting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/campaigns/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: targetConvertCamp._id || targetConvertCamp.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert credits.");

      setSuccess(data.message || "Funds converted successfully!");
      setConvertModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  // Free Payout Trigger
  const handleFreePayoutTrigger = (campaign) => {
    setTargetFreeCamp(campaign);
    setFreePayoutReason("");
    setFreePayoutModalOpen(true);
    setDetailsCampaign(null);
  };

  const handleFreePayoutConfirm = async () => {
    if (!targetFreeCamp) return;
    setSubmittingFreePayout(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/campaigns/free-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: targetFreeCamp._id || targetFreeCamp.id,
          reason: freePayoutReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request.");

      setSuccess("Free payout waiver request submitted successfully to admins.");
      setFreePayoutModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingFreePayout(false);
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
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
            Creator Panel
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            My Campaigns
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your campaigns, convert raised credits to withdrawable balance, or request fee waivers.
          </p>
        </div>
        <button
          onClick={() => onTabChange("add-campaign")}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
        >
          Create Campaign
        </button>
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

      {/* Creator Campaign Action & Details Modal */}
      {detailsCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
              <div>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest block mb-0.5">Campaign Management</span>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white">{detailsCampaign.title}</h3>
              </div>
              <button onClick={() => setDetailsCampaign(null)} className="text-zinc-400 hover:text-zinc-650 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img
                  src={detailsCampaign.image_url}
                  alt={detailsCampaign.title}
                  className="w-full h-48 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                />
                <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Status</span>
                    <span className={`font-bold capitalize ${detailsCampaign.status === "approved" ? "text-emerald-600" : "text-zinc-800 dark:text-white"}`}>{detailsCampaign.status || "pending"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Category</span>
                    <span className="font-bold text-zinc-800 dark:text-white capitalize">{detailsCampaign.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Goal</span>
                    <span className="font-bold text-zinc-800 dark:text-white">{detailsCampaign.funding_goal} cr</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Raised So Far</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{detailsCampaign.amount_raised || 0} cr</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                    <span className="text-zinc-400">Converted Amount</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-350">{detailsCampaign.amount_converted || 0} cr</span>
                  </div>
                  <div className="col-span-2 flex justify-between">
                    <span className="text-zinc-400 font-semibold">Unconverted Balance</span>
                    <span className="font-extrabold text-emerald-600">{(detailsCampaign.amount_raised || 0) - (detailsCampaign.amount_converted || 0)} cr</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deadline</h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                    {new Date(detailsCampaign.deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Campaign Story</h4>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed max-h-36 overflow-y-auto pr-1">
                    {detailsCampaign.story}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Reward Details</h4>
                  <p className="text-xs text-zinc-750 dark:text-zinc-300 font-medium">
                    {detailsCampaign.reward_info}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex flex-wrap gap-3 justify-between items-center w-full">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(detailsCampaign)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Details
                </button>
                <button
                  onClick={() => handleDeleteTrigger(detailsCampaign)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Delete Campaign
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={(Number(detailsCampaign.amount_raised || 0) - Number(detailsCampaign.amount_converted || 0)) <= 0}
                  onClick={() => handleConvertTrigger(detailsCampaign)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 cursor-pointer"
                >
                  Convert Funds
                </button>
                <button
                  disabled={(Number(detailsCampaign.amount_raised || 0) - Number(detailsCampaign.amount_converted || 0)) <= 0}
                  onClick={() => handleFreePayoutTrigger(detailsCampaign)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600 cursor-pointer"
                >
                  Request Free Conversion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Edit Campaign Details</h3>
              <button onClick={() => setEditingCampaign(null)} className="text-zinc-400 hover:text-zinc-650 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditPreSubmit} className="space-y-3 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    required
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Goal (Credits)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.funding_goal}
                    onChange={(e) => setEditFormData({ ...editFormData, funding_goal: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Cover Image</label>
                <div className="space-y-2">
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 cursor-pointer"
                    />
                    {uploadingImage && (
                      <span className="text-xs text-zinc-400 animate-pulse font-semibold">Uploading to ImgBB...</span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="Or enter image URL directly"
                    value={editFormData.image_url}
                    onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                  />
                  {editFormData.image_url && (
                    <img
                      src={editFormData.image_url}
                      alt="Preview"
                      className="h-20 w-36 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Deadline</label>
                <input
                  type="date"
                  required
                  value={editFormData.deadline}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Campaign Story</label>
                <textarea
                  required
                  rows={3}
                  value={editFormData.story}
                  onChange={(e) => setEditFormData({ ...editFormData, story: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Reward Tiers Info</label>
                <input
                  type="text"
                  required
                  value={editFormData.reward_info}
                  onChange={(e) => setEditFormData({ ...editFormData, reward_info: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-550 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  Confirm Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <p className="text-sm text-zinc-500">
            You haven't posted any campaigns yet. Switch to the "Add New Campaign" tab to publish your first cause!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card-based layout for mobile screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {campaigns.map((camp) => {
              const deadlineDate = new Date(camp.deadline).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const raised = Number(camp.amount_raised || 0);

              return (
                <div key={camp._id || camp.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-16 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate" title={camp.title}>
                        {camp.title}
                      </h4>
                      <p className="text-xs text-zinc-500 capitalize">{camp.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-zinc-100 dark:border-zinc-800/80 py-3">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Goal</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{camp.funding_goal} cr</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Raised</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{raised} cr</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-450 block text-3xs">Deadline</span>
                      <span className="font-medium text-zinc-650 dark:text-zinc-300">{deadlineDate}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                      camp.status === "fulfilled"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : camp.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : camp.status === "rejected"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {camp.status === "fulfilled" ? "Fulfilled" : camp.status || "pending"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => setDetailsCampaign(camp)}
                      className="w-full py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100 cursor-pointer"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table view */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4 font-extrabold">Cover</th>
                    <th className="px-6 py-4 font-extrabold">Campaign</th>
                    <th className="px-6 py-4 font-extrabold">Raised Ledger</th>
                    <th className="px-6 py-4 font-extrabold">Deadline</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                    <th className="px-6 py-4 font-extrabold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  {campaigns.map((camp) => {
                    const deadlineDate = new Date(camp.deadline).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    const raised = Number(camp.amount_raised || 0);

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
                          <div className="text-xs text-zinc-500 capitalize">
                            {camp.category}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-zinc-500">
                            Goal: <span className="font-bold text-zinc-700 dark:text-zinc-300">{camp.funding_goal} cr</span>
                          </div>
                          <div className="text-xs text-zinc-500">
                            Raised: <span className="font-bold text-emerald-600 dark:text-emerald-400">{raised} cr</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500">
                          {deadlineDate}
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
                            {camp.status === "fulfilled" ? "Fulfilled" : camp.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDetailsCampaign(camp)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                          >
                            Take Action
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${targetDeleteCamp?.title}"? This will permanently delete the campaign. All supporter pledges (total ${targetDeleteCamp?.amount_raised || 0} credits) will be fully refunded and deducted from your wallet balance, which may go negative.`}
        confirmText={deleting ? "Deleting..." : "Refund & Delete"}
        type="danger"
      />

      <ConfirmationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        title="Update Campaign"
        message="Are you sure you want to save these modifications to your campaign?"
        confirmText="Save Updates"
        type="warning"
      />

      <ConfirmationModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        onConfirm={handleConvertConfirm}
        title="Convert Campaign Funds"
        message={`Are you sure you want to convert the unconverted raised balance of ${(targetConvertCamp?.amount_raised || 0) - (targetConvertCamp?.amount_converted || 0)} credits? A standard $5 platform fee (100 credits) will be deducted, and the net credits will be added to your withdrawable wallet balance.`}
        confirmText={converting ? "Converting..." : "Convert Now"}
        type="success"
      />

      {/* Free Payout request input Modal */}
      {freePayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Request Free Payout</h3>
            <p className="text-xs text-zinc-500">
              Submit a request to waive the platform conversion fee for this campaign. Admins will review your request.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Reason for Free Payout</label>
              <textarea
                required
                rows={3}
                placeholder="Explain why the platform fee should be waived (e.g., nonprofit cause, emergency relief)..."
                value={freePayoutReason}
                onChange={(e) => setFreePayoutReason(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFreePayoutModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-555 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreePayoutConfirm}
                disabled={submittingFreePayout || !freePayoutReason.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-60 cursor-pointer"
              >
                {submittingFreePayout ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
