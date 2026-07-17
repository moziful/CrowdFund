"use client";

import React from "react";
import Link from "next/link";

function formatTimeAgo(dateInput) {
  try {
    const now = new Date();
    const date = new Date(dateInput);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "";
  }
}

export default function NotificationItem({ notification, onRead, onClose }) {
  const { _id, id, message, read, time, category, actionRoute } = notification;

  const getCategoryBadgeStyles = () => {
    switch (category?.toLowerCase()) {
      case "reports":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "campaigns":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "contributions":
      case "funding":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "payouts":
      case "withdrawals":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-650 dark:text-zinc-400 border-zinc-500/25";
    }
  };

  const handleClick = () => {
    if (!read) {
      onRead(_id || id);
    }
    if (onClose) {
      onClose();
    }
  };

  const routePath = actionRoute || (category ? `/dashboard?tab=${category}` : "/dashboard");

  return (
    <Link
      href={routePath}
      onClick={handleClick}
      className={`block px-4 py-3 border-b border-zinc-100 dark:border-zinc-850/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
        !read ? "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Unread Dot Indicator */}
        <span
          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 transition-colors ${
            !read ? "bg-emerald-500 animate-pulse" : "bg-transparent"
          }`}
        />

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            {category && (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getCategoryBadgeStyles()}`}>
                {category}
              </span>
            )}
            <span className="text-[10px] text-zinc-400 font-medium shrink-0">
              {formatTimeAgo(time)}
            </span>
          </div>

          <p className={`text-xs text-zinc-700 dark:text-zinc-300 leading-normal ${!read ? "font-semibold text-zinc-950 dark:text-white" : ""}`}>
            {message}
          </p>
        </div>
      </div>
    </Link>
  );
}
