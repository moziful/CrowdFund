"use client";

import React, { useState } from "react";

export default function Reports({ user }) {
  // Mock data for reports log
  const [reports, setReports] = useState([
    {
      id: 1,
      reporter: "David Chen",
      email: "david@example.com",
      target: "Solar Water Pump Setup",
      reason: "Campaign description contains spelling errors and minor discrepancies.",
      date: "July 15, 2026",
      status: "pending",
    },
    {
      id: 2,
      reporter: "Sarah Jenkins",
      email: "sarah@example.com",
      target: "Reforestation App",
      reason: "Possible duplicate project of Reforestation Initiative.",
      date: "July 12, 2026",
      status: "resolved",
    },
  ]);

  const handleResolve = (id) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, status: "resolved" } : rep))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Platform Security
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          System Reports Log
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor user flags, campaign disputes, and audit reports submitted to the platform.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">Reports Clear</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No system reports or campaign flags have been submitted.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Reported Target</th>
                  <th className="px-6 py-4 font-extrabold">Dispute / Reason</th>
                  <th className="px-6 py-4 font-extrabold">Reporter Details</th>
                  <th className="px-6 py-4 font-extrabold">Date</th>
                  <th className="px-6 py-4 font-extrabold">Status</th>
                  <th className="px-6 py-4 font-extrabold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      {rep.target}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-550 max-w-xs leading-relaxed truncate" title={rep.reason}>
                      {rep.reason}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-300">{rep.reporter}</div>
                      <div className="text-3xs text-zinc-500">{rep.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {rep.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                        rep.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {rep.status === "pending" ? (
                        <button
                          onClick={() => handleResolve(rep.id)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
