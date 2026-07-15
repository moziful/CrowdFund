"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    password: "",
    role: "Supporter",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        throw new Error(data.error?.message || "Failed to upload image to ImgBB.");
      }

      setFormData((prev) => ({ ...prev, avatarUrl: data.data.url }));
      setSuccess("Profile picture uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const validatePassword = (pw) => {
    // Requires at least 6 characters, one letter, and one number
    const minLength = pw.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return minLength && hasLetter && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters long and contain both letters and numbers.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join CrowdFund to raise credits or support initiatives.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A9.75 9.75 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all duration-200"
              />
            </div>
            {uploadingImage && (
              <p className="mt-1.5 text-2xs text-emerald-600 dark:text-emerald-400 animate-pulse font-semibold">
                Uploading image to ImgBB...
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Supporter">Supporter (Starts with 50 Credits)</option>
              <option value="Creator">Creator (Starts with 20 Credits)</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
