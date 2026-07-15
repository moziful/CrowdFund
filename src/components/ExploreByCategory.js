"use client";

import React from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "technology",
    name: "Technology & Gadgets",
    count: "124 campaigns",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    color: "from-blue-600/90 to-cyan-600/90",
  },
  {
    id: "community",
    name: "Community Projects",
    count: "98 campaigns",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=500&q=80",
    color: "from-emerald-600/90 to-teal-600/90",
  },
  {
    id: "art",
    name: "Creative Arts & Exhibits",
    count: "76 campaigns",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=500&q=80",
    color: "from-purple-600/90 to-pink-600/90",
  },
  {
    id: "health",
    name: "Health & Wellbeing",
    count: "45 campaigns",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80",
    color: "from-amber-600/90 to-orange-600/90",
  },
];

export default function ExploreByCategory() {
  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Find and support campaigns that match your specific passions and interests.
          </p>
          <div className="mt-4 h-1 w-20 bg-emerald-500 rounded-full mx-auto" />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?cat=${cat.id}`}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform active:scale-98"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-85 transition-opacity`} />

              {/* Text Information */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                <span className="text-xs font-semibold tracking-wider uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-fit mb-3">
                  {cat.count}
                </span>
                <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <span className="text-xs text-white/80 inline-flex items-center gap-1 mt-2">
                  Browse campaigns
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
