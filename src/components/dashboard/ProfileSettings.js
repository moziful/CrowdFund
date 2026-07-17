"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function ProfileSettings({ user }) {
  const { login } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);

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

      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to upload image.");

      setAvatarUrl(result.data.url);
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      // Update AuthContext user details globally
      login(data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Personal Details
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Profile Settings
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Update your name and profile picture avatar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 space-y-6 shadow-xs">
        
        {/* Avatar Upload / Preview */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-250">Profile Picture</span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition">
                <span>Upload New Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-xs font-bold text-red-500 hover:text-red-650 px-2 py-1.5 transition cursor-pointer"
                >
                  Remove Picture
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-400">Supported formats: JPG, PNG, GIF. Max 5MB.</p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-sm text-zinc-500 dark:text-zinc-500 cursor-not-allowed focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-zinc-400">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {avatarUrl && (
            <div>
              <label className="block text-xs font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Avatar Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Saving Changes..." : "Save Settings"}
        </button>

      </form>
    </div>
  );
}
