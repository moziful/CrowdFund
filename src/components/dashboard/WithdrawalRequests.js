"use client";

import React, { useEffect, useState } from "react";

export default function WithdrawalRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/withdrawals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load withdrawal requests.");
      
      // Filter for only pending payout requests
      const pending = data.filter((w) => w.status === "pending");
      setRequests(pending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    setError("");
    setSuccess("");
    setProcessingId(requestId);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: requestId,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process withdrawal request.");

      setSuccess(`Withdrawal payout successfully ${action === "approve" ? "approved" : "rejected"}!`);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
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
          Platform Treasury
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Withdrawal Requests
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Approve or reject creator payout requests. Rejecting a request automatically returns the credits to the creator's wallet.
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

      {requests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-lg mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">Payout Queue Empty</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            There are no withdrawal payout requests awaiting admin processing.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Request Date</th>
                  <th className="px-6 py-4 font-extrabold">Creator Name</th>
                  <th className="px-6 py-4 font-extrabold">Credits Swapped</th>
                  <th className="px-6 py-4 font-extrabold">Payout Amount</th>
                  <th className="px-6 py-4 font-extrabold">Gateway & Account</th>
                  <th className="px-6 py-4 font-extrabold">Payout Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {requests.map((req) => {
                  const reqDate = new Date(req.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={req._id || req.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                        {reqDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900 dark:text-white">{req.creatorName}</div>
                        <div className="text-3xs text-zinc-500">{req.creatorEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                        {req.withdrawal_credit} Credits
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
                        ${req.withdrawal_amount.toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">{req.payment_system}</span>: {req.account_number}
                      </td>
                      <td className="px-6 py-4">
                        {processingId === (req._id || req.id) ? (
                          <span className="text-xs text-zinc-400 animate-pulse font-semibold">Processing...</span>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction(req._id || req.id, "approve")}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => handleAction(req._id || req.id, "reject")}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 dark:text-red-405 transition-colors cursor-pointer"
                            >
                              Reject Payout
                            </button>
                          </div>
                        )}
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
