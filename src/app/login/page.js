"use client";

import React, { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

  // Google role-selection modal state
  const [pendingGoogle, setPendingGoogle] = useState(null); // { credential, name, email, avatarUrl }
  const [selectedRole, setSelectedRole] = useState("Supporter");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

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

  const handleGoogleCallback = async (response) => {
    setError("");
    setSuccess("Authenticating with Google...");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google login failed.");
      }

      // New user — prompt for role selection
      if (data.exists === false) {
        setSuccess("");
        setPendingGoogle({
          credential: response.credential,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl,
        });
        return;
      }

      // Existing user — log in immediately
      setSuccess("Successfully authenticated via Google! Redirecting...");
      login(data.user, data.token);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleGoogleRoleSubmit = async () => {
    if (!pendingGoogle) return;
    setGoogleSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: pendingGoogle.credential,
          role: selectedRole,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess(`Welcome, ${pendingGoogle.name}! Account created. Redirecting...`);
      setPendingGoogle(null);
      login(data.user, data.token);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  useEffect(() => {
    // Dynamically inject the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn-container"),
          {
            theme: "outline",
            size: "large",
            width: "382",
            text: "signin_with",
            shape: "rectangular",
          }
        );
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-550 dark:hover:text-zinc-350 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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

        {/* Google GSI Container */}
        <div className="flex justify-center w-full min-h-[44px] mt-2">
          <div id="google-signin-btn-container" className="w-full flex justify-center"></div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign Up
          </Link>
        </div>

      </div>

      {/* Role Selection Modal — shown only for new Google users */}
      {pendingGoogle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">

            {/* User Info Header */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={pendingGoogle.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                alt={pendingGoogle.name}
                className="w-16 h-16 rounded-full ring-4 ring-emerald-500/20 object-cover mb-3"
              />
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                Almost there, {pendingGoogle.name.split(" ")[0]}!
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                Choose how you'd like to use CrowdFund. You can always contact support to change this later.
              </p>
            </div>

            {/* Role Cards */}
            <div className="space-y-3 mb-6">
              {/* Supporter Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("Supporter")}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                  selectedRole === "Supporter"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  selectedRole === "Supporter" ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-800"
                }`}>
                  <svg className={`w-5 h-5 ${selectedRole === "Supporter" ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold ${selectedRole === "Supporter" ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                    Supporter
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Browse &amp; back campaigns with credits. Starts with <span className="font-semibold text-emerald-600">50 credits</span>.
                  </p>
                </div>
                {selectedRole === "Supporter" && (
                  <svg className="ml-auto flex-shrink-0 w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Creator Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("Creator")}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                  selectedRole === "Creator"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  selectedRole === "Creator" ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-800"
                }`}>
                  <svg className={`w-5 h-5 ${selectedRole === "Creator" ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold ${selectedRole === "Creator" ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                    Creator
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Launch campaigns &amp; raise credits. Starts with <span className="font-semibold text-emerald-600">20 credits</span>.
                  </p>
                </div>
                {selectedRole === "Creator" && (
                  <svg className="ml-auto flex-shrink-0 w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error inside modal */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <button
              type="button"
              onClick={handleGoogleRoleSubmit}
              disabled={googleSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {googleSubmitting
                ? "Creating Account..."
                : `Continue as ${selectedRole}`}
            </button>
            <button
              type="button"
              onClick={() => { setPendingGoogle(null); setError(""); }}
              className="mt-3 w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel — use a different account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
