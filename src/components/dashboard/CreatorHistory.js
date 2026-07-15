"use client";

import React, { useEffect, useState } from "react";

export default function CreatorHistory({ user }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/withdrawals?creatorEmail=${user.email}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load withdrawal history.");
        setWithdrawals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchWithdrawals();
    }
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Creator Ledger
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Payment History
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review your requested withdrawals, payout status, and historical logs.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
          {error}
        </div>
      )}

      {withdrawals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Withdrawals Logged</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven't requested any fund payouts yet. Submitted request logs will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Request Date</th>
                  <th className="px-6 py-4 font-extrabold">Credits Swapped</th>
                  <th className="px-6 py-4 font-extrabold">Payout Dollars</th>
                  <th className="px-6 py-4 font-extrabold">Gateway & Account</th>
                  <th className="px-6 py-4 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {withdrawals.map((withdrawal) => {
                  const reqDate = new Date(withdrawal.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={withdrawal._id || withdrawal.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                        {reqDate}
                      </td>
                      <td className="px-6 py-4 text-zinc-550 font-bold">
                        {withdrawal.withdrawal_credit} Credits
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
                        ${withdrawal.withdrawal_amount.toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{withdrawal.payment_system}</span> - {withdrawal.account_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                          withdrawal.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : withdrawal.status === "rejected"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {withdrawal.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
