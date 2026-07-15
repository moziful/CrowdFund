"use client";

import React from "react";

export default function AdminHome({ user }) {
  const stats = [
    {
      label: "Pending Campaigns",
      value: "4 Requests",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Registered Users",
      value: "142 Users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.962 5.962 0 00-.94-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.06 2.772m0 0a5.962 5.962 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Pending Withdrawals",
      value: "3 Pending",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Welcome Title */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Admin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Hello, Admin {user?.name || "Administrator"}!
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back to the Admin Workspace. Oversee user roles, campaigns, and withdrawal requests.
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

      {/* Review requests table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Campaign Approval Queue
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 animate-pulse font-semibold">
            Action Required
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                <th className="px-6 py-4 font-extrabold">Campaign Name</th>
                <th className="px-6 py-4 font-extrabold">Creator</th>
                <th className="px-6 py-4 font-extrabold">Goal Credits</th>
                <th className="px-6 py-4 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-zinc-900 dark:text-white">
                  Ocean Cleanup System
                </td>
                <td className="px-6 py-4.5">
                  David Chen
                </td>
                <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-400">
                  2,500 Credits
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                    Pending Review
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-zinc-900 dark:text-white">
                  Community Herb Garden
                </td>
                <td className="px-6 py-4.5">
                  Sarah Jenkins
                </td>
                <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-400">
                  1,200 Credits
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                    Pending Review
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
