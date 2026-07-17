"use client";

import React, { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ManageCampaigns({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Active details modal state
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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal States
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState({ type: "", campaignId: null, data: null });
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

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
      const res = await fetch("/api/campaigns");
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

  // Trigger confirmation modal for status flips or deletions
  const triggerActionModal = (campaignId, actionType, campaignTitle = "") => {
    setModalAction({ type: actionType, campaignId, data: null });
    setError("");
    setSuccess("");

    if (actionType === "approve") {
      setModalTitle("Approve Campaign");
      setModalMessage(`Are you sure you want to approve "${campaignTitle}" and publish it live on the explore page?`);
    } else if (actionType === "reject") {
      setModalTitle("Reject Campaign");
      setModalMessage(`Are you sure you want to reject "${campaignTitle}"? This will hide the campaign submission.`);
    } else if (actionType === "suspend") {
      setModalTitle("Suspend Campaign");
      setModalMessage(`Are you sure you want to suspend fundraising for "${campaignTitle}"? Supporters will no longer be able to back it.`);
    } else if (actionType === "complete") {
      setModalTitle("Mark Campaign Completed");
      setModalMessage(`Are you sure you want to manually mark "${campaignTitle}" as completed (fulfilled)?`);
    } else if (actionType === "delete") {
      setModalTitle("Delete Campaign");
      setModalMessage(`Are you sure you want to delete "${campaignTitle}"? Since you are deleting as Admin, both the Creator and Platform will receive a $1 split, and the rest will be refunded to supporters proportionally.`);
    }

    setActionModalOpen(true);
  };

  // Perform confirmed action
  const handleConfirmedAction = async () => {
    const { type, campaignId } = modalAction;
    if (!campaignId) return;

    setProcessingId(campaignId);
    setError("");
    setSuccess("");
    setDetailsCampaign(null); // Close details modal when action confirms

    try {
      if (type === "delete") {
        const res = await fetch(`/api/campaigns?id=${campaignId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete campaign.");
        setSuccess(data.message);
      } else {
        let newStatus = "";
        if (type === "approve") newStatus = "approved";
        else if (type === "reject") newStatus = "rejected";
        else if (type === "suspend") newStatus = "suspended";
        else if (type === "complete") newStatus = "fulfilled";

        const res = await fetch("/api/campaigns", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: campaignId,
            status: newStatus,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update campaign status.");
        setSuccess(`Campaign successfully marked as ${newStatus}!`);
      }

      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
      setActionModalOpen(false);
    }
  };

  // Trigger Edit modal
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
    setError("");
    setSuccess("");
    setDetailsCampaign(null); // Close details modal when opening edit form
  };

  // Submit edit form (triggers secondary confirmation modal)
  const handleEditPreSubmit = (e) => {
    e.preventDefault();
    setModalAction({ type: "edit", campaignId: editingCampaign._id || editingCampaign.id, data: editFormData });
    setModalTitle("Save Campaign Edits");
    setModalMessage(`Are you sure you want to overwrite details for "${editingCampaign.title}"?`);
    setActionModalOpen(true);
  };

  // Confirm and perform update PUT request
  const handleEditConfirm = async () => {
    const { campaignId, data } = modalAction;
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId,
          ...data,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update campaign.");

      setSuccess("Campaign details successfully updated by Administrator.");
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
      setActionModalOpen(false);
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
          Platform Controls
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Manage Campaigns
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Supervise campaign portfolios. Click "Take Action" to inspect, approve, edit, suspend, complete, or delete any campaign.
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

      {/* Campaign Action & Details Modal */}
      {detailsCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
              <div>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest block mb-0.5">Campaign Inspection</span>
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
                    <span className="font-bold text-zinc-800 dark:text-white capitalize">{detailsCampaign.status || "pending"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Category</span>
                    <span className="font-bold text-zinc-800 dark:text-white capitalize">{detailsCampaign.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Funding Goal</span>
                    <span className="font-bold text-zinc-800 dark:text-white">{detailsCampaign.funding_goal} Credits</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Raised So Far</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{detailsCampaign.amount_raised || 0} Credits</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Creator Information</h4>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{detailsCampaign.creatorName}</p>
                  <p className="text-xs text-zinc-500">{detailsCampaign.creatorEmail}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deadline</h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                    {new Date(detailsCampaign.deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Story / Motivation</h4>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed max-h-32 overflow-y-auto pr-1">
                    {detailsCampaign.story}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Reward Backer Info</h4>
                  <p className="text-xs text-zinc-750 dark:text-zinc-300 font-medium">
                    {detailsCampaign.reward_info}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls panel inside modal */}
            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(detailsCampaign)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => triggerActionModal(detailsCampaign._id || detailsCampaign.id, "delete", detailsCampaign.title)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Delete Campaign
                </button>
              </div>

              <div className="flex gap-2">
                {detailsCampaign.status !== "approved" && (
                  <button
                    onClick={() => triggerActionModal(detailsCampaign._id || detailsCampaign.id, "approve", detailsCampaign.title)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Approve Live
                  </button>
                )}
                {detailsCampaign.status === "pending" && (
                  <button
                    onClick={() => triggerActionModal(detailsCampaign._id || detailsCampaign.id, "reject", detailsCampaign.title)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Reject Application
                  </button>
                )}
                {detailsCampaign.status === "approved" && (
                  <>
                    <button
                      onClick={() => triggerActionModal(detailsCampaign._id || detailsCampaign.id, "suspend", detailsCampaign.title)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-650 text-white text-xs font-bold cursor-pointer"
                    >
                      Suspend Funding
                    </button>
                    <button
                      onClick={() => triggerActionModal(detailsCampaign._id || detailsCampaign.id, "complete", detailsCampaign.title)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Complete Campaign
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Admin: Edit Campaign Details</h3>
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
                  className="px-4 py-2 text-xs font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  Confirm Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <p className="text-sm text-zinc-500">No campaigns exist in the database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card-based layout for mobile screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {campaigns.map((camp) => (
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
                    <span className="text-zinc-400 block mb-0.5">Raised Ledger</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-250">{(camp.amount_raised || 0)} / {camp.funding_goal} CR</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Creator</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate block max-w-[120px]">{camp.creatorName}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-3xs text-zinc-400 truncate max-w-[150px]">{camp.creatorEmail}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                    camp.status === "fulfilled"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : camp.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : camp.status === "suspended"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : camp.status === "rejected"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                  }`}>
                    {camp.status === "fulfilled" ? "Fulfilled" : camp.status || "pending"}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setDetailsCampaign(camp)}
                    className="w-full py-2.5 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100/50 cursor-pointer"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table view */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4 font-extrabold">Cover</th>
                    <th className="px-6 py-4 font-extrabold">Campaign</th>
                    <th className="px-6 py-4 font-extrabold">Raised</th>
                    <th className="px-6 py-4 font-extrabold">Creator</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                    <th className="px-6 py-4 font-extrabold">Action</th>
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
                        {(camp.amount_raised || 0)} / {camp.funding_goal} CR
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        <div>{camp.creatorName}</div>
                        <div className="text-3xs">{camp.creatorEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                          camp.status === "fulfilled"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : camp.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : camp.status === "suspended"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : camp.status === "rejected"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={modalAction.type === "edit" ? handleEditConfirm : handleConfirmedAction}
        title={modalTitle}
        message={modalMessage}
        confirmText="Confirm Action"
        type={modalAction.type === "delete" ? "danger" : "warning"}
      />

    </div>
  );
}
