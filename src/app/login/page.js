"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setSuccess("Login successful! Redirecting...");
      login(data.user, data.token);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    setSuccess("Connecting to Google Mock Sign-In...");
    
    // Simulate Google Sign-In with a mock supporter profile
    const googleUser = {
      id: "google_12345",
      name: "Google Backer",
      email: "google.backer@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Supporter",
      credits: 50,
    };

    setTimeout(() => {
      login(googleUser, "google-mock-jwt-token");
      setSuccess("Successfully authenticated via Google! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access campaigns and manage contributions.
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
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Password
              </label>
              <Link href="#" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Divider line */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 dark:text-zinc-500 font-bold">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Mock Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google
        </button>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
