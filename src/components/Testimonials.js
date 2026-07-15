"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Supporter",
    quote: "Backing projects on CrowdFund is incredibly smooth. I love supporting green energy campaigns and receiving regular progress updates directly from creators.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    id: 2,
    name: "David Chen",
    role: "Creator",
    quote: "CrowdFund helped me raise over 3,000 credits for my modular mechanical keyboard. The creator dashboard is super intuitive and withdrawal was very easy.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    id: 3,
    name: "Aisha Rahman",
    role: "Supporter",
    quote: "The credit system is brilliant. It makes supporting multiple small art installations simple and secure. Highly recommend this platform for discoverability.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    id: 4,
    name: "Marcus Thompson",
    role: "Creator",
    quote: "I launched my hydroponic vertical farming project here. The support and feedback from active backers helped us refine our community deployment plans.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-900 border-t border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            What Our Community Says
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Read inspiring feedback from supporters and creators who have brought initiatives to life.
          </p>
          <div className="mt-4 h-1 w-20 bg-emerald-500 rounded-full mx-auto" />
        </div>

        {/* Swiper Slider Wrapper */}
        <div className="testimonial-swiper-container pb-12">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-emerald-500",
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="w-full"
          >
            {TESTIMONIALS.map((t) => (
              <SwiperSlide key={t.id} className="h-auto py-4">
                <div className="h-full flex flex-col justify-between p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300">
                  <div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-500 mb-6">
                      {[...Array(t.rating)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.1-.214 4.746c-.037.838.868 1.464 1.587 1.029L10 15.657l4.08 2.536c.718.435 1.624-.191 1.587-1.029l-.214-4.746 3.6-3.1c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed italic mb-8">
                      "{t.quote}"
                    </p>
                  </div>

                  {/* Profile info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/25"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-950 dark:text-white leading-none">
                        {t.name}
                      </h4>
                      <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-3xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
