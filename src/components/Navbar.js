"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, mockSetRole } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener to make glassmorphism header dynamic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when path changes
  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const closeDropdowns = () => {
      setProfileOpen(false);
    };
    if (profileOpen) {
      window.addEventListener("click", closeDropdowns);
    }
    return () => window.removeEventListener("click", closeDropdowns);
  }, [profileOpen]);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setProfileOpen(!profileOpen);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    return `/dashboard/${user.role.toLowerCase()}-home`;
  };

  // Safe remote link for Developer
  const githubRepo = "https://github.com/your-username/crowdfunding-platform";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-md border-b border-zinc-200/50 dark:border-zinc-800/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                C
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                CrowdFund
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors ${
                pathname === "/explore"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Explore Campaigns
            </Link>

            {/* Simulated Authentication Switcher for Testing (Subtle style) */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs gap-1">
              <span className="text-zinc-400 mr-1">Simulate Auth:</span>
              <button
                onClick={() => mockSetRole("Supporter")}
                className={`px-1.5 py-0.5 rounded transition ${
                  user?.role === "Supporter"
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                Supporter
              </button>
              <button
                onClick={() => mockSetRole("Creator")}
                className={`px-1.5 py-0.5 rounded transition ${
                  user?.role === "Creator"
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                Creator
              </button>
              <button
                onClick={() => mockSetRole("Admin")}
                className={`px-1.5 py-0.5 rounded transition ${
                  user?.role === "Admin"
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                Admin
              </button>
              {user && (
                <button
                  onClick={() => mockSetRole(null)}
                  className="px-1.5 py-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Conditional Authentication Buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                {/* Available Credits Display */}
                <div className="hidden lg:flex items-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 mr-1 text-emerald-500 animate-pulse"
                  >
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                  </svg>
                  {user.credits} Credits
                </div>

                <Link
                  href={getDashboardLink()}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src={user.photoUrl || "/default-avatar.png"}
                      alt={user.name}
                      className="h-9 w-9 rounded-full ring-2 ring-emerald-500/20 object-cover"
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 p-2 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                        <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-3xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          href={getDashboardLink()}
                          className="flex w-full items-center px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg"
                        >
                          My Dashboard
                        </Link>
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Developer Button */}
            <a
              href={githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-102 transition duration-200"
            >
              Join as Developer
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </a>
          </nav>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-4">
            {user && (
              <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {user.credits} CR
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="space-y-3 pb-3">
            <Link
              href="/explore"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Explore Campaigns
            </Link>

            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Dashboard
                </Link>
                <div className="border-t border-zinc-100 dark:border-zinc-950 pt-3 my-3">
                  <div className="flex items-center px-3 mb-3">
                    <img
                      src={user.photoUrl || "/default-avatar.png"}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="block w-full text-left rounded-lg px-3 py-2 text-base font-semibold text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Register
                </Link>
              </>
            )}

            <a
              href={githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-base font-semibold text-white"
            >
              Join as Developer
            </a>
          </div>

          {/* Simulated Auth Switcher for Mobile */}
          <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              Dev Mode - Switch Auth Role:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => mockSetRole("Supporter")}
                className="py-1 rounded text-xs text-center bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Supporter
              </button>
              <button
                onClick={() => mockSetRole("Creator")}
                className="py-1 rounded text-xs text-center bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Creator
              </button>
              <button
                onClick={() => mockSetRole("Admin")}
                className="py-1 rounded text-xs text-center bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
