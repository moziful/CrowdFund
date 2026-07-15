"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "./Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed ${email} to our newsletter!`);
    setEmail("");
  };

  return (
    <footer className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Combines Brand, Categories, Join Us, and Newsletter in one single row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-b border-zinc-200 dark:border-zinc-800/80">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <span className="h-10 w-10 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                C
              </span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                CrowdFund
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Empowering creators and backers to bring technology, art, and community causes to life globally.
            </p>
          </div>

          {/* Column 2: Explore Categories */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Explore Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/explore?cat=technology" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Technology & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/explore?cat=community" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Community Projects
                </Link>
              </li>
              <li>
                <Link href="/explore?cat=art" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Creative Arts & Exhibits
                </Link>
              </li>
              <li>
                <Link href="/explore?cat=health" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Health & Wellbeing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Join Us */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Join Us
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Member Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Become a Creator
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/moziful/CrowdFund"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  Join as Developer
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2 text-zinc-500 dark:text-zinc-400">
              <a
                href="https://github.com/moziful"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-white hover:scale-105 transition-all duration-200"
                aria-label="GitHub Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/your-username"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-white hover:scale-105 transition-all duration-200"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://facebook.com/your-username"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-white hover:scale-105 transition-all duration-200"
                aria-label="Facebook Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Get weekly updates on top campaigns and platform features.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <Button type="submit" variant="primary" size="md" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Part: Copyright & Custom Attribution */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-zinc-500 dark:text-zinc-500">
            <p>&copy; {currentYear} CrowdFund. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms of Service</a>
            </div>
          </div>

          {/* Custom Attribution */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Developed by{" "}
            <Link
              href="http://moziful.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 font-semibold leading-loose uppercase text-xs bg-sky-100/20 rounded-sm px-1"
            >
              Moziful Haque
            </Link>
          </p>
        </div>

      </div>
    </footer>
  );
}
