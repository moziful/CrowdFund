"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";
import NotificationItem from "./NotificationItem";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const desktopNotifRef = useRef(null);
  const mobileNotifRef = useRef(null);

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
    setNotificationsOpen(false);
  }, [pathname]);

  // Fetch notifications
  const fetchNotifications = async (showLoader = false) => {
    if (!user?.email) return;
    if (showLoader) setLoadingNotif(true);
    try {
      const token = localStorage.getItem("crowd_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      if (showLoader) setLoadingNotif(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop = desktopNotifRef.current?.contains(event.target);
      const inMobile = mobileNotifRef.current?.contains(event.target);
      if (!inDesktop && !inMobile) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, email: user.email }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    return "/dashboard";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Safe remote link for Developer
  const githubRepo = "https://github.com/moziful/CrowdFund";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-md border-b border-zinc-200/50 dark:border-zinc-800/50"
          : "bg-white dark:bg-zinc-950 border-b border-zinc-200/30 dark:border-zinc-800/30"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="h-10 w-10 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
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

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={desktopNotifRef}>
                  <button
                    onClick={() => {
                      if (!notificationsOpen) {
                        fetchNotifications(true);
                      }
                      setNotificationsOpen(!notificationsOpen);
                    }}
                    className="relative p-2 text-zinc-500 hover:text-emerald-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-[55]">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {loadingNotif ? (
                          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                            <span className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium animate-pulse">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <svg className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {notifications.map((notif) => (
                              <NotificationItem
                                key={notif._id || notif.id}
                                notification={notif}
                                onRead={handleMarkAsRead}
                                onClose={() => setNotificationsOpen(false)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={getDashboardLink()}
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith("/dashboard")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group flex items-center gap-2 mr-2">
                  <button className="flex items-center gap-2 focus:outline-none cursor-pointer">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full ring-2 ring-emerald-500/25 object-cover"
                    />
                    <span className="max-w-[100px] truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {user.name}
                    </span>
                  </button>

                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col gap-3">
                    <Link
                      href={getDashboardLink()}
                      className="flex flex-col border-b border-zinc-100 dark:border-zinc-800 pb-2 hover:opacity-85 group/profile-details transition cursor-pointer"
                    >
                      <span className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover/profile-details:text-emerald-500 transition-colors">
                        {user.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </span>
                      <span className="mt-2 w-fit inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-2 text-xs font-bold text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-500/20 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
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
                <Button
                  href="/register"
                  variant="secondary"
                  size="md"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Developer Button */}
            <Button
              href={githubRepo}
              variant="primary"
              size="md"
            >
              Join as Developer
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 ml-1.5"
              >
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Button>
          </nav>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <>
                <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {user.credits} CR
                </div>
                {/* Mobile Notification Bell */}
                <div className="relative" ref={mobileNotifRef}>
                  <button
                    onClick={() => {
                      if (!notificationsOpen) {
                        fetchNotifications(true);
                      }
                      setNotificationsOpen(!notificationsOpen);
                    }}
                    className="relative p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-[55]">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {loadingNotif ? (
                          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                            <span className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium animate-pulse">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <svg className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {notifications.map((notif) => (
                              <NotificationItem
                                key={notif._id || notif.id}
                                notification={notif}
                                onRead={handleMarkAsRead}
                                onClose={() => setNotificationsOpen(false)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none cursor-pointer"
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
              className="block rounded-md px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Explore Campaigns
            </Link>

            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Dashboard
                </Link>
                <div className="border-t border-zinc-100 dark:border-zinc-950 pt-3 my-3">
                  <div className="flex items-center px-3 mb-3">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
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
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-semibold text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-md px-3 py-2 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Register
                </Link>
              </>
            )}

            <Button
              href={githubRepo}
              variant="primary"
              className="w-full"
            >
              Join as Developer
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
