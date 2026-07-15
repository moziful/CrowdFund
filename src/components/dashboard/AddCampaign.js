"use client";

import React, { useState } from "react";

export default function AddCampaign({ user }) {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    category: "Technology",
    funding_goal: "",
    minimum_contribution: "",
    deadline: "",
    reward_info: "",
    image_url: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setFormData((prev) => ({ ...prev, image_url: data.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Field Validation
    if (!formData.title.trim()) return setError("Campaign title is required.");
    if (!formData.story.trim()) return setError("Campaign story details are required.");
    if (Number(formData.funding_goal) <= 0) return setError("Funding goal must be greater than zero.");
    if (Number(formData.minimum_contribution) <= 0) return setError("Minimum contribution must be greater than zero.");
    if (!formData.deadline) return setError("Please select a campaign deadline.");
    if (new Date(formData.deadline) <= new Date()) return setError("Deadline must be a future date.");
    if (!formData.reward_info.trim()) return setError("Reward description is required.");
    if (!formData.image_url) return setError("Please upload a cover image.");

    setSubmitting(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          creatorEmail: user.email,
          creatorName: user.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add campaign.");
      }

      setSuccess(data.message);
      // Reset Form
      setFormData({
        title: "",
        story: "",
        category: "Technology",
        funding_goal: "",
        minimum_contribution: "",
        deadline: "",
        reward_info: "",
        image_url: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Campaign Launchpad
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Add New Campaign
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Fill in your project details, goals, rewards, and upload an attractive cover picture to get started.
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: text values */}
        <div className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Campaign Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Help us build a solar-powered water pump"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Campaign Story & Details
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what your cause or project is, why it is important, and how you will use the credits raised..."
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Funding Goal (Credits)
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="2500"
                value={formData.funding_goal}
                onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Min Pledge (Credits)
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                value={formData.minimum_contribution}
                onChange={(e) => setFormData({ ...formData, minimum_contribution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Technology">Technology</option>
                <option value="Art">Art</option>
                <option value="Community">Community</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Image and Rewards */}
        <div className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Backer Rewards Info
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Backers pledging 250+ credits will receive early beta hardware access and custom printed Cause t-shirts..."
              value={formData.reward_info}
              onChange={(e) => setFormData({ ...formData, reward_info: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Campaign Cover Picture
            </label>
            <div className="flex flex-col gap-4">
              <input
                type="file"
                accept="image/*"
                required={!formData.image_url}
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all duration-200"
              />
              
              {/* Image Preview Card */}
              {formData.image_url ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <img
                    src={formData.image_url}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <span className="text-2xs font-semibold text-white/90 bg-emerald-500 px-2 py-0.5 rounded-md">
                      Cover Uploaded
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 aspect-video flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <span className="text-xs">No cover image uploaded yet</span>
                </div>
              )}
            </div>
            {uploadingImage && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 animate-pulse font-semibold">
                Uploading cover photo to ImgBB...
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? "Saving Campaign..." : "Add Campaign"}
          </button>
        </div>

      </form>
    </div>
  );
}
