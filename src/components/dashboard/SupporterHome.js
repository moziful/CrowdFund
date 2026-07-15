"use client";

import React from "react";

export default function SupporterHome({ user }) {
  const stats = [
    {
      label: "Total Contributions",
      value: "8 Campaigns",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Pending Approvals",
      value: "2 Pledges",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Credits Contributed",
      value: "350 Credits",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Welcome Message */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Backer Portal
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Hello, {user?.name || "Supporter"}!
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back to your Backer Dashboard. Here is a summary of your recent support.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                {stat.value}
              </span>
            </div>
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contributions Activity Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Recent Contributions
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Updated just now
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                <th className="px-6 py-4 font-extrabold">Campaign Target</th>
                <th className="px-6 py-4 font-extrabold">Credits Pledged</th>
                <th className="px-6 py-4 font-extrabold">Contribution Date</th>
                <th className="px-6 py-4 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-zinc-900 dark:text-white">
                  Solar Water Pump Setup
                </td>
                <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-400">
                  150 Credits
                </td>
                <td className="px-6 py-4.5 text-zinc-500">
                  July 14, 2026
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Approved
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-zinc-900 dark:text-white">
                  Ocean Cleanup System
                </td>
                <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-400">
                  200 Credits
                </td>
                <td className="px-6 py-4.5 text-zinc-500">
                  July 10, 2026
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Approved
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-zinc-900 dark:text-white">
                  Reforestation App
                </td>
                <td className="px-6 py-4.5 font-bold text-amber-600 dark:text-amber-400">
                  50 Credits
                </td>
                <td className="px-6 py-4.5 text-zinc-500">
                  July 08, 2026
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
