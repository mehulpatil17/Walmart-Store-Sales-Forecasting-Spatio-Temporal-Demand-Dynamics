"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
          isDark
            ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            : "bg-zinc-200 hover:bg-zinc-300 border border-zinc-300"
        }`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span className="sr-only">Toggle dark mode</span>
        {/* Sliding thumb with animated icon */}
        <span
          className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 ease-in-out ${
            isDark ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {isDark ? (
            <Moon
              size={13}
              className="text-indigo-400 transform transition-transform duration-300 rotate-0 scale-100"
            />
          ) : (
            <Sun
              size={14}
              className="text-amber-500 transform transition-transform duration-300 rotate-0 scale-100"
            />
          )}
        </span>
      </button>

      {showLabel && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </div>
  );
}
