"use client";

import React, { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function WithdrawalRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Inspection Details Modal State
  const [detailsRequest, setDetailsRequest] = useState(null);

  // Custom Modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState({ type: "", requestId: null, request: null });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/withdrawals?admin=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load withdrawal requests.");
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionTrigger = (request, type) => {
    setModalAction({ type, requestId: request._id || request.id, request });
    setActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    const { type, requestId } = modalAction;
    if (!requestId) return;

    setProcessingId(requestId);
    setError("");
    setSuccess("");
    setDetailsRequest(null); // Close inspection modal

    try {
      const res = await fetch("/api/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          status: type === "approve" ? "approved" : "rejected",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process withdrawal.");

      setSuccess(`Withdrawal payout request successfully ${type === "approve" ? "approved" : "rejected"}!`);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
      setActionModalOpen(false);
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Platform Operations
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Withdrawal Requests
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review creators' payout cash-out requests. Make sure you transfer the corresponding USD amount to the creator's gateway account before approving.
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

      {/* Details Inspection Modal */}
      {detailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
              <div>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest block mb-0.5">Payout Inspection</span>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white">Process Withdrawal</h3>
              </div>
              <button onClick={() => setDetailsRequest(null)} className="text-zinc-400 hover:text-zinc-655 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Creator Name</span>
                  <span className="font-bold text-zinc-800 dark:text-white">{detailsRequest.creatorName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Creator Email</span>
                  <span className="font-bold text-zinc-800 dark:text-white">{detailsRequest.creatorEmail}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 col-span-2 flex justify-between">
                  <span className="text-zinc-400">Credits Redeemed</span>
                  <span className="font-bold text-zinc-850 dark:text-zinc-100">{detailsRequest.withdrawal_credit} CR</span>
                </div>
                <div className="col-span-2 flex justify-between">
                  <span className="text-zinc-400 font-semibold">USD Cash Payout</span>
                  <span className="font-extrabold text-emerald-600">${detailsRequest.withdrawal_amount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-2">Recipient Payment Gateway</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400 block text-3xs">Gateway System</span>
                    <span className="font-extrabold text-emerald-650 dark:text-emerald-400 capitalize">{detailsRequest.payment_system}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block text-3xs">Account Reference</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-white">{detailsRequest.account_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout controls */}
            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => handleActionTrigger(detailsRequest, "reject")}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-655 hover:bg-red-50 dark:hover:bg-red-955/20 cursor-pointer"
              >
                Reject Payout
              </button>
              <button
                onClick={() => handleActionTrigger(detailsRequest, "approve")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Approve & Mark Paid
              </button>
            </div>
          </div>
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
        <div className="space-y-4">
          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {requests.map((req) => {
              const reqDate = new Date(req.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={req._id || req.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{req.creatorName}</h4>
                      <p className="text-xs text-zinc-555">{req.creatorEmail}</p>
                    </div>
                    <span className="text-xs text-zinc-400">{reqDate}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-zinc-100 dark:border-zinc-800/80 py-3">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Credits Swapped</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{req.withdrawal_credit} CR</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Payout Amount</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${req.withdrawal_amount.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-zinc-400 block mb-0.5">Gateway & Account</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{req.payment_system}: {req.account_number}</span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setDetailsRequest(req)}
                      className="w-full py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100 cursor-pointer"
                    >
                      Take Action
                    </button>
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
                    <th className="px-6 py-4 font-extrabold">Request Date</th>
                    <th className="px-6 py-4 font-extrabold">Creator Name</th>
                    <th className="px-6 py-4 font-extrabold">Credits Swapped</th>
                    <th className="px-6 py-4 font-extrabold">Payout Amount</th>
                    <th className="px-6 py-4 font-extrabold">Gateway & Account</th>
                    <th className="px-6 py-4 font-extrabold">Action</th>
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
                          <button
                            onClick={() => setDetailsRequest(req)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                          >
                            Take Action
                          </button>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalAction.type === "approve" ? "Approve Payout Request" : "Reject Payout Request"}
        message={
          modalAction.type === "approve"
            ? `Are you sure you want to approve this payout request? By confirming, you verify that you have successfully processed the bank/gateway transfer of $${modalAction.request?.withdrawal_amount.toFixed(2)} USD.`
            : `Are you sure you want to reject this payout request? Rejected requests return the credits back to the creator's wallet.`
        }
        confirmText="Confirm Payout Action"
        type={modalAction.type === "approve" ? "success" : "danger"}
      />

    </div>
  );
}
