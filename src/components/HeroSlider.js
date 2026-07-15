"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const SLIDES = [
  {
    id: 1,
    title: "Bring Creative Projects to Life",
    description: "Join thousands of creators raising funds for groundbreaking technology, art, and community initiatives.",
    ctaText: "Explore Campaigns",
    ctaLink: "/explore",
    bgImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1600&q=80",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: 2,
    title: "Support Causes You Care About",
    description: "Contribute platform credits to fundraisers, eco-friendly startups, and social impact causes making a real difference.",
    ctaText: "Contribute Now",
    ctaLink: "/explore",
    bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    accent: "from-teal-500 to-cyan-600",
  },
  {
    id: 3,
    title: "Empower Innovation & Products",
    description: "Back the next generation of smart gadgets, custom board games, and creative software before they hit the market.",
    ctaText: "Start a Campaign",
    ctaLink: "/register",
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    accent: "from-emerald-600 to-emerald-700",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(handleNext, 7000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <section className="relative w-full h-[650px] md:h-[750px] overflow-hidden bg-zinc-950">
      {/* Slides Container */}
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Zoom animation */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-left">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${slide.accent} px-3 py-1 text-xs font-semibold text-white tracking-wide uppercase mb-6 animate-fade-in`}>
                    Featured Campaign
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none mb-6 drop-shadow-sm">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-zinc-200 mb-10 leading-relaxed font-light">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={slide.ctaLink}
                      className={`inline-flex items-center justify-center rounded-md bg-gradient-to-r ${slide.accent} px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-103 transition-all duration-200`}
                    >
                      {slide.ctaText}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 ml-2"
                      >
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md border border-white/10 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors hidden md:block"
        aria-label="Previous Slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md border border-white/10 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors hidden md:block"
        aria-label="Next Slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-emerald-500"
                : "w-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
