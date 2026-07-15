"use client";

import React, { useEffect } from "react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
}) {
  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Theme-specific colors
  const themeMap = {
    danger: {
      iconBg: "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400",
      btnBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/10",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    warning: {
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
      btnBg: "bg-amber-500 hover:bg-amber-650 focus:ring-amber-500 shadow-amber-500/10",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-500/10",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      iconBg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
      btnBg: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 shadow-sky-500/10",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const currentTheme = themeMap[type] || themeMap.warning;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card Content Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl ${currentTheme.iconBg}`}>
            {currentTheme.icon}
          </div>

          {/* Texts */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white leading-6">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
              {message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/60 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-lg cursor-pointer ${currentTheme.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
