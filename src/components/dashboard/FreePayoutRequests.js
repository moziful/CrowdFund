"use client";

import React, { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function FreePayoutRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Details Modal State
  const [detailsRequest, setDetailsRequest] = useState(null);

  // Custom Modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState({ type: "", request: null });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/campaigns/free-payout");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load requests.");
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
    setModalAction({ type, request });
    setActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    const { type, request } = modalAction;
    if (!request) return;

    setProcessingId(request._id || request.id);
    setError("");
    setSuccess("");
    setDetailsRequest(null); // Close details modal on action

    try {
      const res = await fetch("/api/campaigns/free-payout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request._id || request.id,
          action: type === "approve" ? "approve" : "reject",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request.");

      setSuccess(`Request successfully ${type === "approve" ? "approved" : "rejected"}!`);
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

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Moderation Queue
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Free Payout Requests
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review fee-waiver requests submitted by creators. Approving a request transfers all unconverted raised credits to the creator's wallet with zero platform fee.
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
                <span className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest block mb-0.5">Waiver Request Inspection</span>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white">{detailsRequest.campaignTitle}</h3>
              </div>
              <button onClick={() => setDetailsRequest(null)} className="text-zinc-400 hover:text-zinc-650 cursor-pointer">
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
                <div className="col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">Requested Waiver Amount</span>
                  <span className="font-bold text-emerald-600">{detailsRequest.amount} CR</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Reason for Payout Waiver</h4>
                <div className="text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  "{detailsRequest.reason}"
                </div>
              </div>
            </div>

            {/* Payout controls */}
            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => handleActionTrigger(detailsRequest, "reject")}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 cursor-pointer"
              >
                Reject Waiver
              </button>
              <button
                onClick={() => handleActionTrigger(detailsRequest, "approve")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                Approve & Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-950 dark:text-white">Awaiting Review</h3>
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm text-zinc-400">No pending free payout requests.</p>
          </div>
        ) : (
          <div>
            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {pendingRequests.map((req) => (
                <div key={req._id || req.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{req.campaignTitle}</h4>
                    <p className="text-xs text-zinc-500">Creator: {req.creatorName}</p>
                  </div>
                  <div className="border-t border-b border-zinc-100 dark:border-zinc-800 py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Waiver Amount</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{req.amount} CR</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => setDetailsRequest(req)}
                      className="w-full py-2 text-center text-xs font-bold text-purple-650 bg-purple-50 dark:bg-purple-950/20 rounded-xl hover:bg-purple-100 cursor-pointer"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                      <th className="px-6 py-4 font-extrabold">Creator</th>
                      <th className="px-6 py-4 font-extrabold">Campaign</th>
                      <th className="px-6 py-4 font-extrabold">Credits to Transfer</th>
                      <th className="px-6 py-4 font-extrabold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    {pendingRequests.map((req) => (
                      <tr key={req._id || req.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-zinc-900 dark:text-white">{req.creatorName}</div>
                          <div className="text-3xs text-zinc-500">{req.creatorEmail}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                          {req.campaignTitle}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {req.amount} CR
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDetailsRequest(req)}
                            className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 text-xs font-bold text-purple-650 dark:text-purple-400 transition-colors cursor-pointer"
                          >
                            Take Action
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-zinc-950 dark:text-white">Processed Requests</h3>
        {processedRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm text-zinc-400">No processed requests.</p>
          </div>
        ) : (
          <div>
            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {processedRequests.map((req) => (
                <div key={req._id || req.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{req.campaignTitle}</h4>
                      <p className="text-xs text-zinc-500">Creator: {req.creatorName}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-bold leading-none ${
                      req.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {req.status === "approved" ? "Waiver Approved" : "Rejected"}
                    </span>
                  </div>
                  <div className="text-xs border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between">
                    <span className="text-zinc-400">Amount</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200">{req.amount} CR</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                      <th className="px-6 py-4 font-extrabold">Creator</th>
                      <th className="px-6 py-4 font-extrabold">Campaign</th>
                      <th className="px-6 py-4 font-extrabold">Amount</th>
                      <th className="px-6 py-4 font-extrabold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    {processedRequests.map((req) => (
                      <tr key={req._id || req.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-zinc-900 dark:text-white">{req.creatorName}</div>
                          <div className="text-3xs text-zinc-500">{req.creatorEmail}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                          {req.campaignTitle}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                          {req.amount} CR
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-bold leading-none ${
                            req.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600"
                          }`}>
                            {req.status === "approved" ? "Waiver Approved" : "Rejected"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalAction.type === "approve" ? "Approve Waiver Request" : "Reject Waiver Request"}
        message={
          modalAction.type === "approve"
            ? `Confirming this action will approve the fee-waiver request for "${modalAction.request?.campaignTitle}" and immediately add the full unconverted amount of ${modalAction.request?.amount} credits to the creator's withdrawable wallet balance (waiving the standard platform fee).`
            : `Rejecting this request will require the creator of "${modalAction.request?.campaignTitle}" to pay the standard conversion fee ($5 / 100 credits) to transfer their raised credits.`
        }
        confirmText="Confirm Action"
        type={modalAction.type === "approve" ? "success" : "danger"}
      />

    </div>
  );
}
