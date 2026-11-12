"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/components/SidebarContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header />
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ease-in-out ${
            collapsed ? "max-w-none px-4 sm:px-8 lg:px-12" : "max-w-7xl mx-auto"
          }`}
        >
          {children}
        </main>
        <footer className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-950/80 space-y-1">
          <p>ES 335: Machine Learning • Walmart Recruiting Sales Forecasting Dataset</p>
          <p className="text-zinc-400 dark:text-zinc-500">
            AI tools were used for code refactoring, visualization styling, and documentation drafting. All model decisions, evaluation methodology, and scientific claims were made and verified by the authors.
          </p>
        </footer>
      </div>
    </div>
  );
}
