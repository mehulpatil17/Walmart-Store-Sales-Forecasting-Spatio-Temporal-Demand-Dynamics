"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard,
  Database,
  Calculator,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  BarChart3,
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sliders,
  Table2,
  CheckCircle2,
  Terminal,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink
} from "lucide-react";

interface SidebarProps {
  activeSection?: string;
}

export default function Sidebar({ activeSection = "hero" }: SidebarProps) {
  const { collapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  // Subsections start collapsed per requirement:
  // "menu of sub section of page (page like RESEARCH PORTAL, DATA STUDIO,DEPLOYMENT & DEFENSE) should be collapsed."
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "RESEARCH PORTAL": false,
    "DATA STUDIO": false,
    "DEPLOYMENT & DEFENSE": false,
  });

  const [currentSection, setCurrentSection] = useState<string>(activeSection);

  // Sync scroll spy and hash with current visible section
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      setCurrentSection(window.location.hash.slice(1));
    } else if (pathname === "/studio" || pathname === "/studio/") {
      setCurrentSection("studio");
    } else if (pathname === "/") {
      setCurrentSection("hero");
    }

    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        setCurrentSection(window.location.hash.slice(1));
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    const sectionIds = pathname.startsWith("/studio")
      ? ["architecture", "preprocessing", "features", "overlap", "inspector", "deep-dives", "explorer"]
      : pathname === "/"
      ? [
          "hero",
          "rq",
          "findings",
          "kpis",
          "validation",
          "experiments",
          "diagnostics",
          "error-analysis",
          "conclusion",
          "reproduction",
          "disclosure"
        ]
      : [];

    const elements: HTMLElement[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) elements.push(el);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -65% 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Primary page navigation when sidebar is collapsed (shows only main menu/page options)
  const mainNavPages = [
    { name: "Research Portal", href: "/", icon: LayoutDashboard },
    { name: "Data Studio", href: "/studio", icon: Database },
    { name: "Model Predictor", href: "/predictor", icon: Calculator },
    { name: "Oral Defense", href: "/qna", icon: GraduationCap },
  ];

  // Full detailed tree when sidebar is expanded
  const navGroups = [
    {
      group: "RESEARCH PORTAL",
      badge: "Overview",
      items: [
        { name: "Overview & Verdict", href: "/", icon: LayoutDashboard, sectionId: "hero" },
        { name: "Research Question", href: "/#rq", icon: HelpCircle, sectionId: "rq" },
        { name: "Key Findings", href: "/#findings", icon: Sparkles, sectionId: "findings" },
        { name: "KPI Scorecard", href: "/#kpis", icon: BarChart3, sectionId: "kpis" },
        { name: "Leakage-Free Protocol", href: "/#validation", icon: ShieldCheck, sectionId: "validation" },
        { name: "Model Benchmark", href: "/#experiments", icon: TrendingUp, sectionId: "experiments" },
        { name: "Decision Support", href: "/#diagnostics", icon: Sliders, sectionId: "diagnostics" },
        { name: "Error & Cost Analysis", href: "/#error-analysis", icon: AlertTriangle, sectionId: "error-analysis" },
        { name: "Conclusion & Takeaways", href: "/#conclusion", icon: CheckCircle2, sectionId: "conclusion" },
        { name: "Reproduction & Audit", href: "/#reproduction", icon: Terminal, sectionId: "reproduction" },
        { name: "AI Disclosure & Citations", href: "/#disclosure", icon: BookOpen, sectionId: "disclosure" },
      ]
    },
    {
      group: "DATA STUDIO",
      badge: "Deep Dives",
      items: [
        { name: "Dataset Architecture", href: "/studio#architecture", icon: Database, sectionId: "architecture" },
        { name: "Preprocessing Audit", href: "/studio#preprocessing", icon: Sliders, sectionId: "preprocessing" },
        { name: "Feature Matrix & Signals", href: "/studio#features", icon: Table2, sectionId: "features" },
        { name: "Cohort Overlap Matrix", href: "/studio#overlap", icon: Layers, sectionId: "overlap" },
        { name: "Holdout Trajectory Inspector", href: "/studio#inspector", icon: TrendingUp, sectionId: "inspector" },
        { name: "Domain Deep Dives", href: "/studio#deep-dives", icon: BarChart3, sectionId: "deep-dives" },
        { name: "Interactive Group-By", href: "/studio#explorer", icon: Table2, sectionId: "explorer" },
      ]
    },
    {
      group: "DEPLOYMENT & DEFENSE",
      badge: "Inference",
      items: [
        { name: "Model Predictor", href: "/predictor", icon: Calculator, sectionId: "predictor" },
        { name: "Oral Defense Q&A", href: "/qna", icon: GraduationCap, sectionId: "qna" },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 transition-transform active:scale-95"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-slate-700 dark:bg-zinc-300 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">ES 335 ML</span>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 ease-in-out shadow-xs ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 flex items-center justify-center font-bold shadow-xs flex-shrink-0 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200">
                  <GraduationCap size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">ES 335 ML</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">Walmart Sales</span>
                </div>
              </Link>
              {/* Sidebar collapse button styled like top bar button with PanelLeftClose */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
                title="Collapse sidebar (Expand to Full Screen)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          ) : (
            /* Sidebar expand button styled with PanelLeftOpen when collapsed */
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              title="Expand sidebar (Exit Full Screen)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        {collapsed ? (
          /* Collapsed View: Shows only main menu/page options (per user request) */
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3 flex flex-col items-center">
            {mainNavPages.map((page, idx) => {
              const Icon = page.icon;
              const isActive =
                page.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(page.href);

              return (
                <Link
                  key={idx}
                  href={page.href}
                  className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs border border-slate-700/60 dark:border-zinc-700"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                  } hover:scale-105 active:scale-95 cursor-pointer`}
                  title={page.name}
                  aria-label={page.name}
                >
                  <Icon size={20} className="transition-transform group-hover:scale-110" />
                  {isActive && (
                    <span className="absolute -left-1 w-1 h-5 bg-slate-900 dark:bg-white rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          /* Expanded View: Collapsible sub-sections that start collapsed */
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {navGroups.map((group, gIdx) => {
              const isOpen = openGroups[group.group];

              return (
                <div key={gIdx} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase text-slate-700 dark:text-zinc-300 bg-slate-100/80 hover:bg-slate-200/90 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-800 transition-all duration-200 ease-out group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 group-hover:scale-125 transition-transform" />
                      <span className="truncate">{group.group}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
                        {group.items.length}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-slate-500 dark:text-zinc-400 transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  {/* Sub-section Items (Smooth expand/collapse animation) */}
                  <div
                    className={`space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[700px] opacity-100 pl-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    {group.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      const itemPath = item.href.split("#")[0] || "/";
                      const itemHash = item.href.includes("#") ? item.href.split("#")[1] : null;
                      const isCurrentPage = pathname === itemPath || pathname === `${itemPath}/` || (itemPath === "/" && pathname === "");

                      let isActive = false;
                      if (isCurrentPage) {
                        if (itemHash) {
                          isActive = currentSection === item.sectionId;
                        } else {
                          isActive =
                            currentSection === item.sectionId ||
                            (itemPath === "/studio" && (!currentSection || currentSection === "studio")) ||
                            (itemPath === "/" && (!currentSection || currentSection === "hero"));
                        }
                      } else {
                        isActive = !item.href.includes("#") && (pathname === item.href || pathname === `${item.href}/`);
                      }

                      return (
                        <Link
                          key={iIdx}
                          href={item.href}
                          className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                            isActive
                              ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs border border-slate-700/60 dark:border-zinc-700"
                              : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive
                                ? "text-white dark:text-zinc-100"
                                : "text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200"
                            }`}
                          />
                          <span className="truncate inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer: GitHub & Theme Switch Toggle */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 space-y-2 transition-colors">

          {/* GitHub Repository Link Button */}
          <a
            href="https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department"
            target="_blank"
            rel="noopener noreferrer"
            title="Open GitHub Source Repository"
            className={`group flex items-center rounded-lg text-xs font-semibold transition-all duration-200 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-2xs active:scale-95 ${
              collapsed ? "justify-center p-2.5 w-full" : "justify-between px-3 py-2 w-full"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <svg
                className="w-4 h-4 flex-shrink-0 text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && (
                <span className="truncate">Source Repository</span>
              )}
            </div>
            {!collapsed && (
              <ExternalLink size={13} className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 flex-shrink-0" />
            )}
          </a>

          {/* Animated Theme Toggle in Sidebar */}
          <div className="flex items-center justify-between pt-1">
            <ThemeToggle showLabel={!collapsed} className={collapsed ? "justify-center w-full" : "w-full justify-between"} />
          </div>
        </div>
      </aside>
    </>
  );
}
