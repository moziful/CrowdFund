"use client";

import React from "react";
import Link from "next/link";

export default function CampaignCard({ campaign }) {
  const {
    id,
    title,
    description,
    category,
    funding_goal,
    amount_raised,
    creator_name,
    campaign_image_url,
  } = campaign;

  const percentage = Math.min(100, Math.round((amount_raised / funding_goal) * 100));

  // Determine category badge colors
  const getCategoryStyles = (cat) => {
    switch (cat?.toLowerCase()) {
      case "technology":
        return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-800/50";
      case "community":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50";
      case "art":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50";
      case "health":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50";
      case "education":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50";
      default:
        return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/50";
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:border-zinc-300/50 dark:hover:border-zinc-700/50 transition-all duration-300">
      {/* Campaign Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={campaign_image_url || "https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&w=400&q=80"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${getCategoryStyles(category)}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            {title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            by {creator_name}
          </p>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Progress & Funding Details */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span>{percentage}% Funded</span>
            <span>{amount_raised} / {funding_goal} Credits</span>
          </div>

          {/* Progress Bar Container */}
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <Link
            href={`/campaigns/${id}`}
            className="flex w-full items-center justify-center rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
