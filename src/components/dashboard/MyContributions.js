"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function MyContributions({ user }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContributions, setTotalContributions] = useState(0);
  const limit = 5;

  const fetchContributions = async (page) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contributions?supporterEmail=${user.email}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load contributions.");
      
      if (data.contributions !== undefined) {
        setContributions(data.contributions);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setTotalContributions(data.totalContributions || 0);
      } else {
        setContributions(data);
        setTotalPages(1);
        setCurrentPage(1);
        setTotalContributions(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchContributions(currentPage);
    }
  }, [user?.email, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
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
    <div className="space-y-6 animate-in fade-in duration-305">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Backer Ledger
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          My Contributions
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review campaigns you have backed and track their approval and launch status.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
          {error}
        </div>
      )}

      {contributions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Pledges Found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            You haven't supported any campaigns yet! Browse the explore page to back projects and causes.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Explore Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {contributions.map((pledge) => {
              const pledgeDate = new Date(pledge.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={pledge._id || pledge.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{pledge.campaignTitle}</h4>
                      <p className="text-xs text-zinc-500">Creator: {pledge.creatorName}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                      pledge.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : pledge.status === "rejected"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {pledge.status || "pending"}
                    </span>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between text-xs">
                    <span className="text-zinc-400">Pledge Amount</span>
                    <span className="font-bold text-emerald-650 dark:text-emerald-400">{pledge.amount} Credits</span>
                  </div>

                  <div className="flex justify-between text-3xs text-zinc-400 pt-1">
                    <span>Date</span>
                    <span>{pledgeDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4 font-extrabold">Campaign Name</th>
                    <th className="px-6 py-4 font-extrabold">Credits Contributed</th>
                    <th className="px-6 py-4 font-extrabold">Creator Name</th>
                    <th className="px-6 py-4 font-extrabold">Date</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  {contributions.map((pledge) => {
                    const pledgeDate = new Date(pledge.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr key={pledge._id || pledge.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                          {pledge.campaignTitle}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {pledge.amount} Credits
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {pledge.creatorName}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500">
                          {pledgeDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                            pledge.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : pledge.status === "rejected"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}>
                            {pledge.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Page <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{currentPage}</strong> of <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
