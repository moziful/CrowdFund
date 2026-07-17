"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ExploreCampaigns() {
  const { user, updateCredits } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledging, setPledging] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Report State
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setReporting(true);
    setModalError("");
    setModalSuccess("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign._id || selectedCampaign.id,
          campaignTitle: selectedCampaign.title,
          reason: reportReason,
          reporterName: user?.name,
          reporterEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report.");

      setModalSuccess("Campaign reported successfully! We will investigate this campaign.");
      setReportReason("");
      setShowReportForm(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setReporting(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load campaigns.");

      // Filter: Only approved campaigns where deadline has not passed and funding goal has not been met
      const activeApproved = data.filter(
        (c) =>
          c.status?.toLowerCase() === "approved" &&
          new Date(c.deadline) > new Date() &&
          (c.amount_raised || 0) < c.funding_goal
      );
      setCampaigns(activeApproved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Filter Logic
  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch = camp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.story?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || camp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Pledge Submit
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!user) {
      return setModalError("Please log in to back this campaign.");
    }

    const roleLower = user.role?.toLowerCase();
    if (roleLower !== "supporter") {
      return setModalError("Only Supporters can contribute credits to campaigns.");
    }

    const amount = Number(pledgeAmount);
    if (!pledgeAmount || amount <= 0) {
      return setModalError("Please enter a valid credit amount.");
    }
    if (amount < selectedCampaign.minimum_contribution) {
      return setModalError(`Minimum contribution for this campaign is ${selectedCampaign.minimum_contribution} credits.`);
    }
    if (amount > (user.credits ?? 0)) {
      return setModalError("Insufficient credits. Please purchase more credits in your dashboard.");
    }

    setPledging(true);

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign._id || selectedCampaign.id,
          campaignTitle: selectedCampaign.title,
          amount,
          supporterEmail: user.email,
          supporterName: user.name,
          creatorName: selectedCampaign.creatorName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit pledge.");

      // Deduct credits from user wallet state in Context
      updateCredits((user.credits ?? 0) - amount);

      setModalSuccess(`Successfully contributed ${amount} credits! Pending creator review.`);
      setPledgeAmount("");
      
      // Update campaigns array locally to increment raised
      setCampaigns((prev) =>
        prev.map((c) =>
          (c._id || c.id) === (selectedCampaign._id || selectedCampaign.id)
            ? { ...c, amount_raised: (c.amount_raised || 0) + amount }
            : c
        )
      );
    } catch (err) {
      setModalError(err.message);
    } finally {
      setPledging(false);
    }
  };

  const handleOpenModal = (camp) => {
    setSelectedCampaign(camp);
    setModalError("");
    setModalSuccess("");
    setPledgeAmount("");
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Title Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block">
            Explore Causes
          </span>
          <h1 className="text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Discover Active Campaigns
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Browse through approved community causes, hardware projects, and artistic initiatives. Support your favorites by pledging platform credits.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-4 rounded-2xl shadow-2xs">
          {/* Search Field */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2">
            {["All", "Technology", "Art", "Community", "Health"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex items-center justify-center p-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 text-center max-w-md mx-auto">
            {error}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-24 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">No Campaigns Found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              We couldn't find any approved active campaigns matching your criteria. Try adjusting your query or category filters.
            </p>
          </div>
        ) : (
          /* Grid Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((camp) => {
              const goal = camp.funding_goal || 1;
              const raised = camp.amount_raised || 0;
              const percent = Math.min(Math.round((raised / goal) * 100), 100);

              const daysRemaining = Math.max(
                Math.ceil((new Date(camp.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
                0
              );

              return (
                <div
                  key={camp._id || camp.id}
                  onClick={() => handleOpenModal(camp)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col h-full group cursor-pointer"
                >
                  {/* Cover */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={camp.image_url}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-3xs font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                      {camp.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-5">
                    <div className="space-y-2">
                      <div className="text-3xs text-zinc-400 font-bold uppercase tracking-wider leading-none">
                        By {camp.creatorName}
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white line-clamp-2" title={camp.title}>
                        {camp.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-3 leading-relaxed">
                        {camp.story}
                      </p>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          />
                        </div>
                        <div className="flex items-center justify-between text-3xs font-extrabold uppercase text-zinc-400 dark:text-zinc-550">
                          <span>{percent}% Raised</span>
                          <span>{camp.funding_goal} Cr Goal</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-4">
                        <div>
                          <span className="text-2xs text-zinc-400 block leading-none mb-1">Raised</span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {camp.amount_raised ?? 0} Credits
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xs text-zinc-400 block leading-none mb-1">Time Left</span>
                          <span className="text-base font-black text-zinc-850 dark:text-zinc-200 leading-none">
                            {daysRemaining} Days
                          </span>
                        </div>
                      </div>

                      <div
                        className="w-full py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-350 transition-colors text-center block"
                      >
                        View Details
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Details & Pledge Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/45 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSelectedCampaign(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Scrollable Container */}
            <div className="overflow-y-auto p-6 flex-1 space-y-6">
              
              {/* Cover Photo */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img
                  src={selectedCampaign.image_url}
                  alt={selectedCampaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-3xs font-extrabold uppercase px-2 py-0.5 rounded-md">
                  {selectedCampaign.category}
                </div>
              </div>

              {/* Title & Creator */}
              <div>
                <span className="text-3xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                  Campaign launched by {selectedCampaign.creatorName} ({selectedCampaign.creatorEmail})
                </span>
                <h3 className="text-2xl font-black text-zinc-950 dark:text-white leading-tight">
                  {selectedCampaign.title}
                </h3>
              </div>

              {/* Details and Story */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Our Project Story
                </h4>
                <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-line">
                  {selectedCampaign.story}
                </p>
              </div>

              {/* Reward info */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 9a2 2 0 11-4 0 2 2 0 014 0zm-12 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Supporter Backer Rewards
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed">
                  {selectedCampaign.reward_info}
                </p>
              </div>

              {/* Campaign numbers */}
              <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-zinc-100 dark:border-zinc-800 py-4">
                <div>
                  <span className="text-3xs text-zinc-400 uppercase block mb-1">Funding Target</span>
                  <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedCampaign.funding_goal} Cr</span>
                </div>
                <div>
                  <span className="text-3xs text-zinc-400 uppercase block mb-1">Min Pledge Limit</span>
                  <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedCampaign.minimum_contribution} Cr</span>
                </div>
                <div>
                  <span className="text-3xs text-zinc-400 uppercase block mb-1">Time Remaining</span>
                  <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                    {Math.max(Math.ceil((new Date(selectedCampaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)), 0)} Days
                  </span>
                </div>
              </div>

              {/* Status alerts inside modal */}
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                  {modalSuccess}
                </div>
              )}

              {/* Pledge section */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-805 pt-4">
                {!user ? (
                  <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-3">Please sign in to support this project cause.</p>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    >
                      Login Now
                    </Link>
                  </div>
                ) : user.role?.toLowerCase() !== "supporter" ? (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-center border border-zinc-200/50 dark:border-zinc-800 text-xs text-zinc-400">
                    You are logged in as a <span className="font-bold text-zinc-550 dark:text-zinc-300">{user.role}</span>. Only Supporters can contribute credits.
                  </div>
                ) : (
                  <form onSubmit={handlePledgeSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Enter Pledge Amount (Your Credits: {user.credits ?? 0})
                      </label>
                      <span className="text-3xs text-zinc-400">Min: {selectedCampaign.minimum_contribution} Credits</span>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        required
                        min={selectedCampaign.minimum_contribution}
                        placeholder={`e.g. ${selectedCampaign.minimum_contribution}`}
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={pledging}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                      >
                        {pledging ? "Pledging..." : "Confirm Pledge"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Report Campaign Section */}
              {user && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(!showReportForm)}
                    className="text-xs font-bold text-red-500 hover:text-red-650 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {showReportForm ? "Cancel Reporting" : "Report Campaign"}
                  </button>

                  {showReportForm && (
                    <form onSubmit={handleReportSubmit} className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-155">
                      <textarea
                        required
                        rows="3"
                        placeholder="Explain the discrepancy, copyright violation, or concern about this campaign..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        disabled={reporting}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {reporting ? "Submitting..." : "Submit Report"}
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
