"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Withdrawals({ user }) {
  const { updateCredits } = useAuth();
  const [creditsToWithdraw, setCreditsToWithdraw] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("Stripe");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentCredits = user.credits ?? 0;
  const withdrawAmountDollars = creditsToWithdraw ? Number(creditsToWithdraw) / 20 : 0;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const creditsNum = Number(creditsToWithdraw);
    if (!creditsToWithdraw || creditsNum <= 0) {
      return setError("Please enter a valid credit amount to withdraw.");
    }
    if (creditsNum < 200) {
      return setError("Minimum withdrawal limit is 200 credits ($10).");
    }
    if (creditsNum > currentCredits) {
      return setError("Insufficient credits. You cannot withdraw more than your current credits.");
    }
    if (!accountNumber.trim()) {
      return setError("Please specify your checkout account number.");
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorEmail: user.email,
          creatorName: user.name,
          withdrawal_credit: creditsNum,
          payment_system: paymentSystem,
          account_number: accountNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request.");

      // Deduct credits locally from state
      updateCredits(currentCredits - creditsNum);

      setSuccess(`Withdrawal request for $${withdrawAmountDollars} submitted! Awaiting administrator review.`);
      setCreditsToWithdraw("");
      setAccountNumber("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Creator Vault
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Withdraw Funds
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Convert your accumulated campaign credits into real currency. (Exchange rate: 20 Credits = $1 USD. Minimum payout: 200 Credits)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">
              Your Current Balance
            </h3>
            <span className="text-4xl font-black tracking-tight block">
              {currentCredits} Credits
            </span>
          </div>

          <div className="border-t border-white/20 pt-4 flex justify-between items-center">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-widest text-emerald-100 block mb-0.5">
                Withdrawable Value
              </span>
              <span className="text-2xl font-bold">
                ${(currentCredits / 20).toFixed(2)} USD
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form Container */}
        {currentCredits < 200 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-center space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Withdrawal Locked</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You must raise a minimum of 200 credits ($10 USD) to withdraw. Keep sharing your campaign links!
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Credits to Withdraw
              </label>
              <input
                type="number"
                required
                min="200"
                max={currentCredits}
                placeholder="200"
                value={creditsToWithdraw}
                onChange={(e) => setCreditsToWithdraw(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Withdraw Amount ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-sm text-zinc-450 font-bold">$</span>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={withdrawAmountDollars.toFixed(2)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-850/50 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Payment Gateway
                </label>
                <select
                  value={paymentSystem}
                  onChange={(e) => setPaymentSystem(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Stripe">Stripe Checkout</option>
                  <option value="Bkash">bKash Mobile Money</option>
                  <option value="Nagad">Nagad Payout</option>
                  <option value="Rocket">Rocket Payout</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Account / Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acct_123 or phone number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50 mt-4"
            >
              {submitting ? "Submitting Request..." : "Request Payout"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
