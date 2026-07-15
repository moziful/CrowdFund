"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PurchaseCredit({ user }) {
  const { updateCredits } = useAuth();
  const [amountDollars, setAmountDollars] = useState("10");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const creditsPurchased = Number(amountDollars) * 10;

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(amountDollars) <= 0) {
      return setError("Purchase amount must be greater than $0.");
    }
    if (cardNumber.length < 16) {
      return setError("Please enter a valid 16-digit card number.");
    }
    if (!expiry || !cvv) {
      return setError("Please fill out expiry date and CVV.");
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amountDollars: Number(amountDollars),
          creditsPurchased,
          cardLast4: cardNumber.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process transaction.");

      // Update Credits count in local session state
      const currentCredits = user.credits ?? 0;
      updateCredits(currentCredits + creditsPurchased);

      setSuccess(`Transaction successful! Added ${creditsPurchased} credits to your account.`);
      setAmountDollars("10");
      setCardNumber("");
      setExpiry("");
      setCvv("");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Credit Depot
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Purchase Credits
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Add credits to your backer wallet to support creator campaigns. (Exchange rate: $1 USD = 10 Credits)
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

      <form onSubmit={handlePurchase} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 space-y-5 shadow-xs">
        
        {/* Tier Presets */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
            Select Amount
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[10, 20, 50, 100].map((dollars) => (
              <button
                key={dollars}
                type="button"
                onClick={() => setAmountDollars(String(dollars))}
                className={`py-3 rounded-xl border text-sm font-extrabold transition-all ${
                  amountDollars === String(dollars)
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/35"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                ${dollars}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Or Custom Amount ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-sm text-zinc-400 font-semibold">$</span>
            <input
              type="number"
              min="5"
              placeholder="Custom USD value"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            You will receive <span className="font-bold text-emerald-500">{creditsPurchased} Credits</span>.
          </p>
        </div>

        {/* Card info */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Simulated Checkout Card Details
          </h4>
          
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Card Number</label>
            <input
              type="text"
              required
              maxLength="16"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">Expiry Date</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                maxLength="5"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">CVV</label>
              <input
                type="text"
                required
                maxLength="3"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50"
        >
          {processing ? "Processing Checkout..." : `Pay $${amountDollars || 0} USD`}
        </button>

      </form>
    </div>
  );
}
