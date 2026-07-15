"use client";

import React from "react";

const STATS = [
  {
    value: "15,400+",
    label: "Active Supporters",
    description: "Individuals backing campaigns.",
  },
  {
    value: "1.24M+",
    label: "Credits Distributed",
    description: "Pledged directly to creators.",
  },
  {
    value: "98.2%",
    label: "Campaign Success Rate",
    description: "Reaching or exceeding set goals.",
  },
  {
    value: "24/7",
    label: "Operations & Support",
    description: "Safe transaction monitoring.",
  },
];

export default function PlatformStats() {
  return (
    <section className="py-20 bg-zinc-950 text-white border-t border-zinc-900 overflow-hidden relative">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Platform Impact
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Fostering creative ideas, sustainable initiatives, and green solutions by connecting supporters with visionaries.
          </p>
          <div className="mt-4 h-1 w-20 bg-emerald-500 rounded-full mx-auto" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-emerald-500/20 hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight mb-2">
                {stat.value}
              </span>
              <h3 className="text-base font-bold text-white mb-1">
                {stat.label}
              </h3>
              <p className="text-xs text-zinc-400 leading-normal">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
