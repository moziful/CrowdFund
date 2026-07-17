"use client";

import React, { useEffect, useState } from "react";

export default function RevenueLedger({ user }) {
  const [feeUsd, setFeeUsd] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingFee, setUpdatingFee] = useState(false);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resConfig, resRecords] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/settings/revenue")
      ]);

      if (!resConfig.ok || !resRecords.ok) {
        throw new Error("Failed to load revenue ledger details.");
      }

      const configData = await resConfig.json();
      const recordsData = await resRecords.json();

      setFeeUsd(configData.platform_fee_usd ?? "5.0");
      setRecords(recordsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    setUpdatingFee(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform_fee_usd: Number(feeUsd) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update platform fee.");

      setSuccess("Platform fee configuration successfully updated!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingFee(false);
    }
  };

  const totalRevenueUsd = records.reduce((acc, curr) => acc + Number(curr.fee_deducted_usd || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Platform Treasury
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Revenue Ledger
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage platform conversion fee configurations and view accumulated revenue transactions from campaign splits and payouts.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg space-y-2 col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-100">
            Total Accumulated Revenue
          </h3>
          <span className="text-4xl font-black tracking-tight block">
            ${totalRevenueUsd.toFixed(2)} USD
          </span>
          <p className="text-3xs text-emerald-150 pt-2 border-t border-white/10">
            Sum of all conversion fees ($5 default) and Admin campaign deletions ($2 split).
          </p>
        </div>

        {/* Update Fee Form Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-2xl shadow-xs col-span-2">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Configure Conversion Fee</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Specify the standard USD fee deducted when creators convert raised campaign credits to withdrawable balance.
          </p>
          <form onSubmit={handleUpdateFee} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Conversion Fee ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={feeUsd}
                onChange={(e) => setFeeUsd(e.target.value)}
                placeholder="5.00"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={updatingFee}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {updatingFee ? "Saving..." : "Update Configuration"}
            </button>
          </form>
        </div>
      </div>

      {/* Revenue Log Table */}
      <div>
        <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-3">Revenue Transaction Logs</h3>
        {records.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm text-zinc-400">No revenue records logged yet.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {records.map((rec, i) => {
                const dateStr = new Date(rec.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={rec._id || i} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{rec.campaignTitle}</h4>
                        <p className="text-xs text-zinc-500">Creator: {rec.creatorName}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-bold leading-none ${
                        rec.type === "admin_deletion"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {rec.type === "admin_deletion" ? "Delete Split" : "Conversion"}
                      </span>
                    </div>

                    <div className="border-t border-zinc-105 dark:border-zinc-800 pt-2 text-xs flex justify-between">
                      <span className="text-zinc-400">Original Amount</span>
                      <span className="font-semibold text-zinc-850 dark:text-zinc-200">{rec.total_credits} CR</span>
                    </div>

                    <div className="text-xs flex justify-between">
                      <span className="text-zinc-400">Revenue Earned</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+${rec.fee_deducted_usd?.toFixed(2)} USD</span>
                    </div>

                    <div className="text-3xs text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                      <span>{dateStr}</span>
                      <span>{rec.creatorEmail}</span>
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
                    <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                      <th className="px-6 py-4 font-extrabold">Date</th>
                      <th className="px-6 py-4 font-extrabold">Campaign cause</th>
                      <th className="px-6 py-4 font-extrabold">Creator details</th>
                      <th className="px-6 py-4 font-extrabold">Original Credits</th>
                      <th className="px-6 py-4 font-extrabold">Fee Deducted ($)</th>
                      <th className="px-6 py-4 font-extrabold">Transaction Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    {records.map((rec, i) => {
                      const dateStr = new Date(rec.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <tr key={rec._id || i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                          <td className="px-6 py-4 text-xs text-zinc-500">
                            {dateStr}
                          </td>
                          <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                            {rec.campaignTitle}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-500">
                            <div>{rec.creatorName}</div>
                            <div className="text-3xs">{rec.creatorEmail}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {rec.total_credits} CR
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            +${rec.fee_deducted_usd?.toFixed(2)} USD <span className="text-3xs text-zinc-400 font-normal">({rec.fee_deducted_credits} CR)</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-bold leading-none ${
                              rec.type === "admin_deletion"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}>
                              {rec.type === "admin_deletion" ? "Admin Campaign Delete Split" : "Standard Conversion Fee"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
