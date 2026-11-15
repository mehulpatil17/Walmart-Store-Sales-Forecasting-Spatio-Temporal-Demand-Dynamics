"use client";

import React from "react";
import Link from "next/link";
import { Download, ShieldCheck, Database, Award } from "lucide-react";
import resultsData from "@/data/results.json";

export default function Header() {
  const { metadata } = resultsData;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-300">
      {/* Left: Course & Title (Indian Institute of Technology Gandhinagar removed per instruction) */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {metadata.course}
            </span>
          </div>
          <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hidden sm:block">
            {metadata.title}
          </h1>
        </div>
      </div>

      {/* Right: Key Badges & Download Actions (Dark mode toggle removed per instruction) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dataset Scale Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors">
          <Database size={13} className="text-zinc-500 dark:text-zinc-400" />
          <span>536k Obs • 45 Stores • 81 Depts</span>
        </div>

        {/* Validation Firewall Badge with Emerald Integrity Highlight */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 border border-zinc-300/80 dark:border-zinc-700/80 transition-colors">
          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>Strict <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zero-Leakage</span> Holdout</span>
        </div>

        {/* Download results.json button with smooth micro-animation */}
        <a
          href="/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department/data/results.json"
          download="results.json"
          className="group relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all duration-300 ease-out border border-zinc-300/80 dark:border-zinc-700/80 active:scale-95 shadow-2xs"
          title="Download single-source-of-truth results.json"
        >
          <Download size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
          <span className="hidden sm:inline transition-transform duration-200 group-hover:-translate-y-0.5">Export JSON</span>
        </a>

        {/* Link to oral defense with smooth micro-animation and refined slate-shade */}
        <Link
          href="/qna"
          className="group relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 shadow-xs transition-all duration-300 ease-out border border-slate-700/50 hover:shadow-md active:scale-95"
        >
          <Award size={14} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 text-amber-300" />
          <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">Oral Defense</span>
        </Link>
      </div>
    </header>
  );
}
