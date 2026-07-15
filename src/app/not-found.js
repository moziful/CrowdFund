"use client";

import React from "react";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center">
        
        {/* Warning Icon */}
        <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Huge Error Code */}
        <h1 className="text-7xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent tracking-tight mb-2">
          404
        </h1>

        {/* Text */}
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Return Button */}
        <Button href="/" variant="primary" size="lg" className="w-full">
          Back to Homepage
        </Button>
        
      </div>
    </div>
  );
}
