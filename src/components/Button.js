"use client";

import React from "react";
import Link from "next/link";

export default function Button({
  children,
  onClick,
  href,
  type = "button",
  variant = "primary", // primary, secondary, outline, ghost
  size = "md", // sm, md, lg
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3.5 text-base rounded-lg",
  };

  // Check if a custom text color class is passed in className to avoid Tailwind conflicts
  const hasTextColor = className.split(" ").some(c => c.startsWith("text-"));

  const variantStyles = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20",
    secondary: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100",
    outline: `border border-zinc-200 dark:border-zinc-800 bg-white/5 backdrop-blur-md ${hasTextColor ? "" : "text-zinc-900 dark:text-white"} hover:bg-zinc-100 dark:hover:bg-zinc-900/50`,
    ghost: `${hasTextColor ? "" : "text-zinc-700 dark:text-zinc-300"} hover:bg-zinc-100 dark:hover:bg-zinc-900`,
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={combinedStyles} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedStyles} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedStyles} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
