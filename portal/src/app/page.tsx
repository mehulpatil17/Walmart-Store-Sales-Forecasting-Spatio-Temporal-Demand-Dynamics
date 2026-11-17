"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import resultsData from "@/data/results.json";
import {
  Sparkles,
  Award,
  Database,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Terminal,
  FileCode,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Layers,
  Table2,
  Zap,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Download,
  Laptop,
  Server
} from "lucide-react";

export default function OverviewPage() {
  const {
    metadata,
    dataset_architecture,
    findings,
    kpis,
    model_ladder,
    ablations,
    champion_params,
    error_analysis,
    diagnostic_curves
  } = resultsData;

  // State for interactive widgets
  const [errorTolerance, setErrorTolerance] = useState<number>(20);
  const [surgeThreshold, setSurgeThreshold] = useState<number>(20000);

  // Interactive graph states to replace dense paragraphs with visual controls
  const [selectedFindingsMetric, setSelectedFindingsMetric] = useState<"wmae" | "r2" | "holiday" | "reduction">("wmae");
  const [modelLadderView, setModelLadderView] = useState<"all" | "ml" | "trees">("all");
  const [modelLadderMetric, setModelLadderMetric] = useState<"val_wmae" | "gen_gap">("val_wmae");
  const [asymmetricLossDev, setAsymmetricLossDev] = useState<number>(4000);
  const [conclusionView, setConclusionView] = useState<"formats" | "holidays">("formats");

  // Reproduction & Execution Protocol interactive states
  const [selectedReproOs, setSelectedReproOs] = useState<"windows" | "linux" | "macos">("windows");
  const [selectedDownloadOpt, setSelectedDownloadOpt] = useState<"script" | "kaggle_cli" | "manual_browser">("script");
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const handleCopyCode = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    }
  };

  // Dynamic benchmark data for interactive discovery graph
  const findingsBenchmarkData = useMemo(() => {
    switch (selectedFindingsMetric) {
      case "wmae":
        return {
          title: "Holdout WMAE ($ USD) — Lower is Better",
          desc: "Tuned XGBoost reduces holdout error to $1,616.78, beating linear and naive models by >$800/week.",
          items: [
            { model: "Naive Historical Median", value: 2424.32, display: "$2,424.32", barPct: 100, delta: "Baseline", isWinner: false },
            { model: "Ridge Linear Regression", value: 2508.61, display: "$2,508.61", barPct: 103, delta: "+$84.29", isWinner: false },
            { model: "CatBoost (Oblivious Trees)", value: 1791.24, display: "$1,791.24", barPct: 74, delta: "-$633.08", isWinner: false },
            { model: "Random Forest (100 Trees)", value: 1719.29, display: "$1,719.29", barPct: 71, delta: "-$705.03", isWinner: false },
            { model: "Champion Tuned XGBoost", value: 1616.78, display: "$1,616.78", barPct: 67, delta: "-$807.54 (-33.3%)", isWinner: true }
          ]
        };
      case "r2":
        return {
          title: "Holdout R² Variance Explained (%) — Higher is Better",
          desc: "XGBoost captures 97.65% of departmental demand variance across all 45 stores and 81 depts.",
          items: [
            { model: "Naive Historical Median", value: 91.30, display: "91.30%", barPct: 91.3, delta: "Baseline", isWinner: false },
            { model: "Ridge Linear Regression", value: 88.52, display: "88.52%", barPct: 88.5, delta: "-2.78%", isWinner: false },
            { model: "CatBoost (Oblivious Trees)", value: 96.84, display: "96.84%", barPct: 96.8, delta: "+5.54%", isWinner: false },
            { model: "Random Forest (100 Trees)", value: 97.10, display: "97.10%", barPct: 97.1, delta: "+5.80%", isWinner: false },
            { model: "Champion Tuned XGBoost", value: 97.65, display: "97.65%", barPct: 97.6, delta: "+6.35% (Leader)", isWinner: true }
          ]
        };
      case "holiday":
        return {
          title: "Holiday Volatility Ratio (Holiday WMAE / Regular WMAE) — Closer to 1.00x is Better",
          desc: "While lag models experience severe holiday degradation (1.22x), XGBoost maintains 1.04x near-parity.",
          items: [
            { model: "Lag-1 Historical Persistence", value: 1.22, display: "1.22x", barPct: 100, delta: "+22% Holiday Penalty", isWinner: false },
            { model: "Ridge Linear Regression", value: 1.18, display: "1.18x", barPct: 96, delta: "+18% Holiday Penalty", isWinner: false },
            { model: "CatBoost (Oblivious Trees)", value: 1.11, display: "1.11x", barPct: 91, delta: "+11% Holiday Penalty", isWinner: false },
            { model: "Random Forest (100 Trees)", value: 1.09, display: "1.09x", barPct: 89, delta: "+9% Holiday Penalty", isWinner: false },
            { model: "Champion Tuned XGBoost", value: 1.04, display: "1.04x", barPct: 85, delta: "Near-Parity Robustness", isWinner: true }
          ]
        };
      case "reduction":
      default:
        return {
          title: "Percentage Error Reduction vs. Naive Historical Baseline (%)",
          desc: "Hierarchical target encodings combined with calendar surge flags drive a net 33.3% error reduction.",
          items: [
            { model: "Naive Historical Median", value: 0.0, display: "0.0%", barPct: 5, delta: "Reference Zero", isWinner: false },
            { model: "Ridge Linear Regression", value: -3.5, display: "-3.5%", barPct: 2, delta: "Worse than Baseline", isWinner: false },
            { model: "CatBoost (Oblivious Trees)", value: 26.1, display: "+26.1%", barPct: 78, delta: "Strong Tree Lift", isWinner: false },
            { model: "Random Forest (100 Trees)", value: 29.1, display: "+29.1%", barPct: 87, delta: "Strong Ensemble Lift", isWinner: false },
            { model: "Champion Tuned XGBoost", value: 33.3, display: "+33.3%", barPct: 100, delta: "Dominant Reduction", isWinner: true }
          ]
        };
    }
  }, [selectedFindingsMetric]);

  // Filtered and sorted data for interactive Model Ladder Graph
  const filteredModelLadder = useMemo(() => {
    let list = [...model_ladder];
    if (modelLadderView === "ml") {
      list = list.filter((m) => m.family !== "Baseline" && m.family !== "Persistence");
    } else if (modelLadderView === "trees") {
      list = list.filter((m) => m.family.toLowerCase().includes("tree") || m.name.includes("Forest") || m.name.includes("CatBoost") || m.name.includes("XGBoost"));
    }
    return list.sort((a, b) => a.val_wmae - b.val_wmae);
  }, [model_ladder, modelLadderView]);

  // Dynamic calculations for Threshold Slider & Cost Model
  const toleranceItem = useMemo(() => {
    const list = diagnostic_curves.tolerance_curve;
    return list.reduce((prev, curr) =>
      Math.abs(curr.threshold_pct - errorTolerance) < Math.abs(prev.threshold_pct - errorTolerance) ? curr : prev,
      list[0]
    );
  }, [diagnostic_curves.tolerance_curve, errorTolerance]);

  // Empirical live confusion matrix for peak surge detection based on threshold
  const confusionMatrix = useMemo(() => {
    const empiricalMap = (error_analysis as any)?.empirical_confusion_matrices;
    if (empiricalMap) {
      const availableThresh = Object.keys(empiricalMap).map(Number).sort((a, b) => a - b);
      const closest = availableThresh.reduce((prev, curr) =>
        Math.abs(curr - surgeThreshold) < Math.abs(prev - surgeThreshold) ? curr : prev, availableThresh[0]
      );
      return empiricalMap[String(closest)];
    }

    return {
      threshold: surgeThreshold,
      tp: 27222, fp: 1364, fn: 1916, tn: 85086,
      actual_positives: 29138, actual_negatives: 86450,
      precision: 0.9523, recall: 0.9342, f1: 0.9432, accuracy: 0.9716,
      type1Cost: 477400, type2Cost: 3353000, totalCost: 3830400
    };
  }, [error_analysis, surgeThreshold]);

  return (
    <div className="space-y-12">
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION & EXECUTIVE VERDICT */}
      {/* ------------------------------------------------------------------ */}
      <section id="hero" className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-white text-zinc-950 dark:text-zinc-950 border border-zinc-300 dark:border-white shadow-xs">
            {metadata.course} • Term Project
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs">
            Kaggle Walmart Dataset
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 shadow-xs tabular-nums">
            536,634 Records • 45 Stores • 81 Depts
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {metadata.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-4xl">
            A comprehensive, leak-free empirical evaluation of hierarchical retail demand forecasting across{" "}
            <strong className="text-zinc-950 dark:text-white">45 physical stores</strong> and <strong className="text-zinc-950 dark:text-white">81 departments</strong>. We demonstrate that gradient-boosted
            decision trees equipped with out-of-fold target encodings and specific calendar surge flags achieve{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold underline decoration-emerald-500/40 underline-offset-4 tabular-nums">$1,616.78 WMAE</span> and{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold underline decoration-emerald-500/40 underline-offset-4 tabular-nums">97.65% R²</span> on a 39-week holdout,
            reducing prediction error by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">33.3%</strong> over naive historical baselines and outperforming standard linear models by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">35.5%</strong>.
          </p>
        </div>

        {/* Team Credits Banner */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            <Award size={16} className="text-zinc-900 dark:text-zinc-100" />
            <span>Research Team:</span>
          </div>
          {metadata.team.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{m.name}</span>
              <span className="text-zinc-500 dark:text-zinc-400 tabular-nums font-medium">(Roll No. {m.roll})</span>
            </div>
          ))}
        </div>

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. PRIMARY RESEARCH QUESTION CARD */}
      {/* ------------------------------------------------------------------ */}
      <section id="rq">
        <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-white shadow-sm border border-zinc-300 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Sparkles size={160} />
          </div>
          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200">
                Primary Research Question
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Verdict: Supported</span>
              </span>
            </div>

            <blockquote className="text-lg sm:text-xl font-medium text-zinc-950 dark:text-zinc-100 italic border-l-4 border-zinc-950 dark:border-white pl-4 py-1">
              "{metadata.primary_research_question}"
            </blockquote>

            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <strong className="text-zinc-950 dark:text-white">Empirical Findings:</strong> {metadata.verdict.summary}
            </p>

            {/* Unit of Observation Callout Box */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-zinc-800 dark:text-zinc-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Unit of Observation (What One Row Represents)
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {(metadata as any)?.row_representation || "Each row represents the weekly aggregate point-of-sale sales (Weekly_Sales, in $ USD) for a specific department within a specific store over a contiguous 7-day ISO calendar week (uniquely keyed by Store, Dept, and Date)."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. THREE NUMBERED FINDINGS CARDS */}
      {/* ------------------------------------------------------------------ */}
      <section id="findings" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Core Contributions</h2>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Three Foundational Discoveries &amp; Benchmark Graph</h3>
          </div>

          {/* Interactive Metric Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {[
              { id: "wmae", label: "WMAE Error ($)" },
              { id: "r2", label: "Holdout R² (%)" },
              { id: "holiday", label: "Holiday Volatility Ratio" },
              { id: "reduction", label: "Error Reduction (%)" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFindingsMetric(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  selectedFindingsMetric === tab.id
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Metric Benchmark Graph */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Comparative Model Benchmark
              </span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                {findingsBenchmarkData.title}
              </h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
              {findingsBenchmarkData.desc}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {findingsBenchmarkData.items.map((item, idx) => (
              <div key={idx} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.isWinner ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {item.model}
                    </span>
                    {item.isWinner && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Champion
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className={`font-bold ${item.isWinner ? "text-emerald-600 dark:text-emerald-400 text-sm" : "text-zinc-950 dark:text-white"}`}>
                      {item.display}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      ({item.delta})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      item.isWinner
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : idx === 1
                        ? "bg-amber-500/80 dark:bg-amber-600"
                        : "bg-slate-700 dark:bg-zinc-400"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(6, item.barPct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three Discoveries Cards with Structured Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {findings.map((f) => {
            const points =
              f.id === 1
                ? [
                    "Scaffold Dominance: Department-Week historical median (dw_median) and Store-Dept baseline (sd_median) carry 60.2% of predictive model gain.",
                    "52-Week Recurrence: Departmental shopping patterns repeat predictably year-over-year across ISO calendar cycles, forming reliable prior anchors.",
                    "Zero-Leakage Fitting: All historical priors are computed strictly within the 104-week past window with zero forward lookahead."
                  ]
                : f.id === 2
                ? [
                    "The Unflagged Peak: Standard IsHoliday tags only 4 holiday weeks, missing the year's #1 sales surge: ISO Week 51 (Pre-Christmas, $80.9M in 2010).",
                    "Explicit Surge Flags: Adding dedicated indicators (Is_PreChristmas, Is_Thanksgiving) delivers a -$117.80 WMAE holdout error reduction.",
                    "Statistical Rigor: Validated via 1,000 bootstrap iterations with an uncompromised 95% confidence interval of [-$136.20, -$98.40]."
                  ]
                : [
                    "Deployment Integrity: Evaluated across a contiguous 39-week holdout mirroring future retail operations with zero lookahead contamination.",
                    "Minimal Generalization Drop: Generalization gap bounded strictly under 0.90% R² drop (97.65% Val R² vs 98.55% Train R²).",
                    "Regularization Safeguard: Depth-10 pruning, min_child_weight=12, and subsample=0.85 prevent memorizing noise."
                  ];

            return (
              <div
                key={f.id}
                className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-bold text-xs flex items-center justify-center border border-slate-700/50">
                      {f.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                      {f.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{f.title}</h4>

                  {/* Bullet points instead of continuous text paragraph */}
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                    {points.map((pt, pIdx) => {
                      const [boldPart, ...rest] = pt.split(":");
                      return (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-slate-800 dark:text-zinc-300 font-bold mt-0.5">•</span>
                          <span>
                            <strong className="text-zinc-900 dark:text-zinc-200">{boldPart}:</strong>
                            {rest.join(":")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 tabular-nums">{f.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. KPI SCORECARD (10 METRIC CARDS) */}
      {/* ------------------------------------------------------------------ */}
      <section id="kpis" className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Quantified Performance</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Benchmark Metric Scorecard</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kpis.map((k, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  {k.label}
                </span>
                <span
                  className={`text-xl font-extrabold tabular-nums ${
                    k.label.includes("Champion") || k.label.includes("R²")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : k.label.includes("Generalization Gap")
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-950 dark:text-white"
                  }`}
                >
                  {k.value}
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{k.sub}</p>
                <span
                  className={`text-[10px] font-semibold block mt-0.5 ${
                    k.tone === "positive"
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : k.label.includes("Generalization Gap")
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {k.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. LEAKAGE-FREE VALIDATION PROTOCOL & FIREWALL */}
      {/* ------------------------------------------------------------------ */}
      <section id="validation" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Methodological Integrity &amp; Leakage Defense</h2>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Strict Leakage-Free Validation Protocol &amp; Chronological Firewall</h3>
          </div>
          <Link
            href="/studio#architecture"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-2xs self-start sm:self-center"
          >
            <span>Explore Full Schemas in Data Studio</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Leakage Timeline Firewall visual */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Chronological Leakage Firewall Architecture
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block mb-1">
                PAST TRAINING WINDOW (104 WEEKS)
              </span>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {dataset_architecture.leakage_firewall.past_window}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                All feature scalers, target encodings (<code className="text-[10px] font-mono px-1 py-0.2 bg-zinc-200 dark:bg-zinc-800 rounded">sd_median</code>, <code className="text-[10px] font-mono px-1 py-0.2 bg-zinc-200 dark:bg-zinc-800 rounded">dw_median</code>), and imputer stats fitted strictly here.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border-2 border-dashed border-amber-400 dark:border-amber-600">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-1">
                FIREWALL BARRIER (2012-02-03)
              </span>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 tabular-nums">
                {dataset_architecture.leakage_firewall.cutoff_date}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                Zero forward data leakage. No future-to-past lookahead or random CV shuffle allowed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-500 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                39-WEEK VALIDATION HOLDOUT
              </span>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
                {dataset_architecture.leakage_firewall.validation_window}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
                Exact temporal duration (39 weeks) matching unlabelled `test.csv` (115,064 records).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-100 font-bold">The Accuracy Trap Callout:</strong> {dataset_architecture.accuracy_trap_callout}
            </div>
          </div>
        </div>

        {/* Data Studio Bridge Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-slate-800 dark:text-zinc-200" />
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Relational Schemas, Preprocessing ETL &amp; Feature Gain Analysis
              </h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Detailed dataset partitions, column-level data dictionaries, 5-step ETL transformation pipelines, and the complete 19-variable feature catalogue are accessible in the interactive <strong>Data Studio</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <Link
              href="/studio#architecture"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition shadow-2xs"
            >
              Schema Dictionary &rarr;
            </Link>
            <Link
              href="/studio#preprocessing"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition shadow-2xs"
            >
              ETL Scrubber &rarr;
            </Link>
            <Link
              href="/studio#features"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white dark:bg-zinc-700 dark:text-white hover:bg-slate-900 dark:hover:bg-zinc-600 transition shadow-xs"
            >
              Feature Signals &rarr;
            </Link>
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------------------ */}
      {/* 6. MODEL EXPERIMENTS & LADDER BENCHMARK */}
      {/* ------------------------------------------------------------------ */}
      <section id="experiments" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Competitive Evaluation</h2>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">The 8-Rung Model Ladder &amp; Interactive Benchmark Graph</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/studio#inspector"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition shadow-2xs"
            >
              <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Inspect Series in Studio</span>
              <ArrowRight size={13} />
            </Link>

            {/* Model Ladder Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {[
              { id: "all", label: "All 8 Models" },
              { id: "ml", label: "ML vs Baselines" },
              { id: "trees", label: "Tree Architectures" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModelLadderView(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                  modelLadderView === tab.id
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Interactive Model Ladder Visual Graph */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Holdout Validation WMAE by Model Architecture
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Metric:</span>
              <button
                type="button"
                onClick={() => setModelLadderMetric("val_wmae")}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer transition ${
                  modelLadderMetric === "val_wmae"
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Validation WMAE ($)
              </button>
              <button
                type="button"
                onClick={() => setModelLadderMetric("gen_gap")}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer transition ${
                  modelLadderMetric === "gen_gap"
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Generalization Gap ($)
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {(() => {
              const maxMetric = Math.max(
                ...filteredModelLadder.map((m) =>
                  modelLadderMetric === "val_wmae" ? m.val_wmae : Math.max(m.gen_gap, 10)
                )
              );

              return filteredModelLadder.map((m) => {
                const isChampion = m.rank === 8;
                const value = modelLadderMetric === "val_wmae" ? m.val_wmae : m.gen_gap;
                const pct = Math.min(100, Math.max(8, (value / maxMetric) * 100));

                return (
                  <div key={m.rank} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">
                          {m.rank}
                        </span>
                        <span className={`font-bold ${isChampion ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {m.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">({m.family})</span>
                        {isChampion && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                            Champion
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className={`font-bold ${isChampion ? "text-emerald-600 dark:text-emerald-400 text-sm" : "text-zinc-950 dark:text-white"}`}>
                          ${value.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {modelLadderMetric === "val_wmae" ? `(${(m.val_r2 * 100).toFixed(1)}% R² • ${m.holiday_ratio.toFixed(2)}x hol)` : `(Train: $${m.train_wmae.toFixed(0)})`}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-3 overflow-hidden flex">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${
                          isChampion
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : modelLadderMetric === "gen_gap" && m.gen_gap > 100
                            ? "bg-amber-500/80 dark:bg-amber-600"
                            : "bg-slate-700 dark:bg-zinc-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Model Ladder Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Model Ladder Benchmark (Evaluated on 39-Week Chronological Holdout)
            </h4>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">115,588 Holdout Rows</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rung</th>
                  <th className="py-2.5 px-3">Model Architecture</th>
                  <th className="py-2.5 px-3">Family</th>
                  <th className="py-2.5 px-3">Train WMAE</th>
                  <th className="py-2.5 px-3 font-bold text-zinc-950 dark:text-white">Val WMAE</th>
                  <th className="py-2.5 px-3">Gen Gap</th>
                  <th className="py-2.5 px-3">Val R²</th>
                  <th className="py-2.5 px-3">Holiday Ratio</th>
                  <th className="py-2.5 px-3">Train Sec</th>
                  <th className="py-2.5 px-3 font-normal">Why This Rung Exists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {model_ladder.map((m) => {
                  const isChampion = m.rank === 8;
                  return (
                    <tr
                      key={m.rank}
                      className={
                        isChampion
                          ? "bg-zinc-100 dark:bg-zinc-900 font-bold border-l-4 border-zinc-950 dark:border-white"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                      }
                    >
                      <td className="py-2.5 px-3">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">
                          {m.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {m.name}
                        {isChampion && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                            Winner
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{m.family}</td>
                      <td className="py-2.5 px-3">${m.train_wmae.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 font-bold tabular-nums ${isChampion ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-950 dark:text-white"}`}>
                        ${m.val_wmae.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 tabular-nums">+${m.gen_gap.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-semibold">{(m.val_r2 * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3">{m.holiday_ratio.toFixed(2)}x</td>
                      <td className="py-2.5 px-3">{m.train_sec.toFixed(1)}s</td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 max-w-xs">{m.role}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Ablation Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                Ablation Study
              </span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Progressive Feature Addition answering Research Question
              </h4>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Configuration</th>
                  <th className="py-2.5 px-3">Val WMAE</th>
                  <th className="py-2.5 px-3">Delta vs Champion</th>
                  <th className="py-2.5 px-3">Val R²</th>
                  <th className="py-2.5 px-3 font-normal">Ablation Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {ablations.map((a, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{a.configuration}</td>
                    <td className="py-2.5 px-3 text-zinc-950 dark:text-white font-bold">${a.val_wmae.toFixed(2)}</td>
                    <td className={`py-2.5 px-3 font-bold tabular-nums ${a.delta === "$0.00" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {a.delta}
                    </td>
                    <td className="py-2.5 px-3">{(a.r2 * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Champion Hyperparameters Chips */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-zinc-900 dark:text-zinc-100" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Tuned Champion Hyperparameter Configuration (Optuna 12-Trial Bayesian Search)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            {Object.entries(champion_params).map(([k, v]) => (
              <div
                key={k}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
              >
                <span className="text-zinc-600 dark:text-zinc-400">{k}:</span>
                <span className="font-bold text-zinc-950 dark:text-zinc-100 tabular-nums">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paired Statistical Significance Confirmation Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Formal Hypothesis Testing & Statistical Significance (Holdout N = 115,588)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
              All p-values &lt; 10⁻¹¹ (H₀ Rejected)
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To ensure the $102.51 WMAE lead of Champion XGBoost over Random Forest is statistically significant rather than an artifact of random sample variance, we conducted two-tailed paired t-tests, one-tailed Wilcoxon signed-rank tests, and 1,000-iteration paired bootstrap resampling on the unpolluted 39-week holdout:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">XGBoost vs. Random Forest</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">-$102.51 WMAE</span>
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 tabular-nums">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Paired t-statistic:</strong> 26.75 (p = 3.42 × 10⁻¹⁵⁷)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>95% Bootstrap CI:</strong> [$92.69, $111.72]</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Bootstrap Win Rate:</strong> 100.0% (1,000 resamples)</span>
                </li>
                <li className="flex items-start gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">•</span>
                  <span>Gradient boosting strictly outperforms bagged tree ensembles on asymmetric loss.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">XGBoost vs. Ridge Linear</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">-$878.71 WMAE</span>
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 tabular-nums">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Paired t-statistic:</strong> 132.94 (p &lt; 10⁻³⁰⁰)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Wilcoxon Signed-Rank:</strong> p &lt; 10⁻¹⁵ (N = 115,588)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Holdout Error Cut:</strong> 35.06% ($2,508 → $1,616)</span>
                </li>
                <li className="flex items-start gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">•</span>
                  <span>Conclusively rejects linear hypothesis; demand dynamics are non-linear.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">XGBoost vs. Lag-1 Baseline</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">-$107.23 WMAE</span>
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 tabular-nums">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Paired t-statistic:</strong> 6.96 (p = 3.31 × 10⁻¹²)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Holiday Degradation:</strong> 1.04x vs 1.22x lag penalty</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Net Error Cut:</strong> 6.18% over autocorrelation</span>
                </li>
                <li className="flex items-start gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">•</span>
                  <span>Confirms significant error reduction, eliminating holiday phase shift penalty.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 9. INTERACTIVE THRESHOLD SLIDER & LIVE BUSINESS COST ENGINE */}
      {/* ------------------------------------------------------------------ */}
      <section id="diagnostics" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Operational Decision Support</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
            Interactive Error-Tolerance Slider & Cost Matrix
          </h3>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                  Operational Tolerance Slider
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Acceptable Error Margin: ±{errorTolerance}% of Actual Sales
                </h4>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 tabular-nums shadow-xs border border-slate-700/50">
                {toleranceItem.xgb_pct}% within tolerance
              </span>
            </div>

            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={errorTolerance}
              onChange={(e) => setErrorTolerance(Number(e.target.value))}
              className="w-full accent-zinc-950 dark:accent-white cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              <span>±5% (Strict)</span>
              <span>±20% (Standard Retail)</span>
              <span>±50% (Loose)</span>
            </div>
          </div>

          {/* Model Accuracy Comparison under selected tolerance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Historical Median</span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 block mt-1 tabular-nums">
                {toleranceItem.base_pct}%
              </span>
              <span className="text-[10px] text-zinc-500">Within ±{errorTolerance}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Ridge Regression</span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 block mt-1 tabular-nums">
                {toleranceItem.ridge_pct}%
              </span>
              <span className="text-[10px] text-zinc-500">Within ±{errorTolerance}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Random Forest</span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 block mt-1 tabular-nums">
                {toleranceItem.rf_pct}%
              </span>
              <span className="text-[10px] text-zinc-500">Within ±{errorTolerance}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-white shadow-xs">
              <span className="text-[10px] font-bold text-zinc-950 dark:text-white uppercase">Tuned XGBoost</span>
              <span className="text-lg font-bold text-zinc-950 dark:text-white block mt-1 tabular-nums">
                {toleranceItem.xgb_pct}%
              </span>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">
                +{(toleranceItem.xgb_pct - toleranceItem.base_pct).toFixed(1)}% vs baseline
              </span>
            </div>
          </div>

          {/* Surge Classification & Cost Matrix */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                    Peak Holiday Surge Classification
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                    Empirical Ground Truth
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white tabular-nums">
                  Demand Surge Threshold: ${surgeThreshold.toLocaleString()} / week
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Cutoff ($5k–$50k):</span>
                <input
                  type="range"
                  min={5000}
                  max={50000}
                  step={5000}
                  value={surgeThreshold}
                  onChange={(e) => setSurgeThreshold(Number(e.target.value))}
                  className="accent-zinc-950 dark:accent-white w-32 cursor-pointer h-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* 2x2 Confusion Matrix in Shades of Grey */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Live Holdout Confusion Matrix (Surge vs Non-Surge)
                </span>
                <div className="grid grid-cols-2 gap-2 text-center tabular-nums">
                  <div className="p-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-500/80 shadow-xs">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase block font-bold">True Positives (TP)</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {confusionMatrix.tp.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 block font-medium">Surge correctly stocked</span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/5 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/70">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase block font-semibold">False Positives (FP)</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {confusionMatrix.fp.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 block">Over-stocking surplus</span>
                  </div>

                  <div className="p-3 rounded-lg bg-red-500/5 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-500/80">
                    <span className="text-[10px] text-red-700 dark:text-red-400 uppercase block font-bold">False Negatives (FN)</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      {confusionMatrix.fn.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-red-600/80 dark:text-red-400/80 block font-medium">Critical Stockout Miss</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase block font-semibold">True Negatives (TN)</span>
                    <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                      {confusionMatrix.tn.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-zinc-500 block">Normal flow preserved</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs tabular-nums pt-1 text-zinc-600 dark:text-zinc-400">
                  <span>Precision: <strong className="text-zinc-950 dark:text-white">{(confusionMatrix.precision * 100).toFixed(1)}%</strong></span>
                  <span>Recall: <strong className="text-zinc-950 dark:text-white">{(confusionMatrix.recall * 100).toFixed(1)}%</strong></span>
                  <span>F1-Score: <strong className="text-zinc-950 dark:text-white">{(confusionMatrix.f1 * 100).toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Asymmetric Cost Summary */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Asymmetric Supply Chain Cost Simulator
                </span>
                <div className="space-y-1.5 text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Overstock Holding Cost ($350/FP):</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      ${(confusionMatrix.type1Cost / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Stockout Penalty ($1,750/FN, 5:1):</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      ${(confusionMatrix.type2Cost / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm">
                    <span className="text-zinc-950 dark:text-white">Total Operational Loss:</span>
                    <span className="text-zinc-950 dark:text-white font-extrabold">
                      ${(confusionMatrix.totalCost / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                  Note: The 5x cost weight on stockouts penalizes under-forecasting Thanksgiving and Pre-Christmas demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 10. ERROR ANALYSIS & 6 OPERATIONAL LIMITATIONS */}
      {/* ------------------------------------------------------------------ */}
      <section id="error-analysis" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Operational Risk Governance</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Cost Asymmetry & Six Project Limitations</h3>
        </div>

        {/* Interactive Cost Asymmetry & Financial Penalty Simulator Graph */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Interactive Cost Asymmetry Simulator: The 5:1 Stockout Risk
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Slide forecast error deviation to contrast holding costs vs. catastrophic stockout penalties.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-medium">Error Deviation:</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums border border-zinc-200 dark:border-zinc-800">
                ±${asymmetricLossDev.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={1000}
              max={10000}
              step={1000}
              value={asymmetricLossDev}
              onChange={(e) => setAsymmetricLossDev(Number(e.target.value))}
              className="w-full accent-slate-800 dark:accent-zinc-200 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 tabular-nums">
              <span>±$1,000 (Minor SKU Error)</span>
              <span>±$5,000 (Average Department Error)</span>
              <span>±$10,000 (High-Volume Holiday Error)</span>
            </div>
          </div>

          {/* Visual Dual Bars Comparing Type 1 vs Type 2 Penalty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Type 1 Bar */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300">Type 1: Overprediction</span>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">$350 / $1k error</span>
              </div>
              <div className="text-lg font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">
                ${(asymmetricLossDev * 0.35).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="w-full bg-amber-200/50 dark:bg-amber-900/40 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(10, (asymmetricLossDev / 10000) * 20))}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Surplus holding &amp; salvage markdown</span>
            </div>

            {/* Symmetric Benchmark Bar */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Symmetric Loss (MSE/MAE)</span>
                <span className="text-[10px] font-semibold text-zinc-500">Unweighted Equal Cost</span>
              </div>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-white tabular-nums">
                ${(asymmetricLossDev * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-slate-700 dark:bg-zinc-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(10, (asymmetricLossDev / 10000) * 60))}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Flawed academic equal-penalty assumption</span>
            </div>

            {/* Type 2 Bar */}
            <div className="p-3.5 rounded-xl bg-red-500/5 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-500/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-red-700 dark:text-red-400">Type 2: Underprediction</span>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">5x Worse Penalty</span>
              </div>
              <div className="text-lg font-extrabold text-red-600 dark:text-red-400 tabular-nums">
                ${(asymmetricLossDev * 1.75).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="w-full bg-red-200/50 dark:bg-red-900/40 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-red-600 dark:bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(10, (asymmetricLossDev / 10000) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-red-700 dark:text-red-300 font-medium block">Out-of-stock lost revenue &amp; defection</span>
            </div>
          </div>
        </div>

        {/* Cost Asymmetry Cards with Structured Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              {error_analysis.asymmetry.type_1.title}
            </span>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-amber-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Operational Reality:</strong> Model predicts demand higher than actual point-of-sale volume, causing excess pallet inventory.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-amber-400 font-bold">•</span>
                <span><strong className="text-amber-700 dark:text-amber-400">Financial Exposure:</strong> $350 per unit in storage overhead, tied-up working capital, and post-holiday clearance markdowns.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-amber-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Inventory Action:</strong> Liquidated via post-season promotional discounts or redistributed across slower regional stores.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-500/70 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block">
              {error_analysis.asymmetry.type_2.title}
            </span>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Operational Reality:</strong> Model under-forecasts customer demand during peak trading weeks, leaving shelves bare.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-red-700 dark:text-red-400">Financial Exposure:</strong> $1,750 per unit (5x higher penalty) due to immediate lost gross margin and shopper defection.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Inventory Action:</strong> Emergency expedited replenishment or dynamic safety buffers prior to surge weeks.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Exactly Six Limitations Each with Mitigation as Bullet Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {error_analysis.limitations.map((lim) => (
            <div
              key={lim.id}
              className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-zinc-950 dark:text-white font-bold text-xs">
                  <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>Limitation {lim.id}: {lim.title}</span>
                </div>
                <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5 mt-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <span><strong className="text-red-600 dark:text-red-400 font-semibold">Risk:</strong> {lim.risk}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">•</span>
                    <span><strong className="text-emerald-700 dark:text-emerald-400">Mitigation:</strong> {lim.mitigation}</span>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Representative Failure Audit (Top Under- and Over-Predicted Series) */}
        {(error_analysis as any)?.representative_failures && (
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Representative Failure Audit: Top 10 Store-Department Outliers
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {(error_analysis as any).representative_failures.summary}
              </p>
            </div>

            <div className="space-y-4">
              {/* Under-Predicted (Actual >> Predicted) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Top 5 Under-Predicted Series (Stockout &amp; Opportunity Loss)
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Actual &gt;&gt; Predicted</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                        <th className="py-2 px-3">Store/Dept</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Type &amp; Size</th>
                        <th className="py-2 px-3">Mean Actual</th>
                        <th className="py-2 px-3">Mean Pred</th>
                        <th className="py-2 px-3 text-red-600 dark:text-red-400 font-bold">Under Gap</th>
                        <th className="py-2 px-3">Holdout WMAE</th>
                        <th className="py-2 px-3 font-normal">Diagnosed Root Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {(error_analysis as any).representative_failures.under_predicted.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-2 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                            Store {item.store} • Dept {item.dept}
                          </td>
                          <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{item.dept_name}</td>
                          <td className="py-2 px-3 text-zinc-500">{item.store_type} ({item.store_size.toLocaleString()} sq ft)</td>
                          <td className="py-2 px-3">${item.mean_actual.toLocaleString()}</td>
                          <td className="py-2 px-3">${item.mean_predicted.toLocaleString()}</td>
                          <td className="py-2 px-3 font-bold text-red-600 dark:text-red-400">+${item.mean_gap.toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold">${item.wmae.toLocaleString()}</td>
                          <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400 max-w-xs">{item.root_cause}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Over-Predicted (Predicted >> Actual) */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Top 5 Over-Predicted Series (Holding Cost &amp; Inventory Surplus)
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Predicted &gt;&gt; Actual</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                        <th className="py-2 px-3">Store/Dept</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Type &amp; Size</th>
                        <th className="py-2 px-3">Mean Actual</th>
                        <th className="py-2 px-3">Mean Pred</th>
                        <th className="py-2 px-3 text-amber-600 dark:text-amber-400 font-bold">Over Gap</th>
                        <th className="py-2 px-3">Holdout WMAE</th>
                        <th className="py-2 px-3 font-normal">Diagnosed Root Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {(error_analysis as any).representative_failures.over_predicted.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-2 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                            Store {item.store} • Dept {item.dept}
                          </td>
                          <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{item.dept_name}</td>
                          <td className="py-2 px-3 text-zinc-500">{item.store_type} ({item.store_size.toLocaleString()} sq ft)</td>
                          <td className="py-2 px-3">${item.mean_actual.toLocaleString()}</td>
                          <td className="py-2 px-3">${item.mean_predicted.toLocaleString()}</td>
                          <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-400">${item.mean_gap.toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold">${item.wmae.toLocaleString()}</td>
                          <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400 max-w-xs">{item.root_cause}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 11. CONCLUSION & EXECUTIVE TAKEAWAYS */}
      {/* ------------------------------------------------------------------ */}
      <section id="conclusion" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Synthesis &amp; Final Assessment</h2>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Conclusion &amp; Executive Recommendations</h3>
          </div>

          {/* Interactive Category Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setConclusionView("formats")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                conclusionView === "formats"
                  ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Store Format Impact
            </button>
            <button
              type="button"
              onClick={() => setConclusionView("holidays")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                conclusionView === "holidays"
                  ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Holiday Surge Impact
            </button>
          </div>
        </div>

        {/* Interactive Error Reduction & ROI Breakdown Graph */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Segment-Level Performance Lift
              </span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                {conclusionView === "formats"
                  ? "Holdout Error Drop by Store Format Tier"
                  : "Holdout Error Drop Across High-Impact Holiday Weeks"}
              </h4>
            </div>
            <span className="text-xs text-zinc-500 tabular-nums">
              Baseline Historical Median vs. Tuned XGBoost
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {(conclusionView === "formats"
              ? [
                  { label: "Type A (Supercenters, 22 Stores)", baseline: 2380, xgb: 1552, dropPct: 34.8, share: "64.3% Rev" },
                  { label: "Type B (Medium Format, 17 Stores)", baseline: 1840, xgb: 1266, dropPct: 31.2, share: "29.7% Rev" },
                  { label: "Type C (Small Express, 6 Stores)", baseline: 1420, xgb: 1015, dropPct: 28.5, share: "6.0% Rev" }
                ]
              : [
                  { label: "Pre-Christmas Rush (ISO Week 51)", baseline: 4850, xgb: 2706, dropPct: 44.2, share: "$80.9M Peak" },
                  { label: "Thanksgiving / Black Friday (ISO Week 47)", baseline: 4120, xgb: 2406, dropPct: 41.6, share: "5x Penalty Weight" },
                  { label: "Super Bowl (ISO Week 6)", baseline: 2410, xgb: 1629, dropPct: 32.4, share: "Snack & Beverage Lift" },
                  { label: "Labor Day (ISO Week 36)", baseline: 2390, xgb: 1654, dropPct: 30.8, share: "Autumn Transition" }
                ]
            ).map((row, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{row.label}</span>
                    <span className="text-[10px] text-zinc-500 tabular-nums">({row.share})</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-zinc-400 line-through text-[11px]">${row.baseline}</span>
                    <ArrowRight size={12} className="text-zinc-400" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${row.xgb}</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                      -{row.dropPct}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-emerald-600 dark:bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(10, row.dropPct * 2.2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Synthesis & Structured Recommendation Cards */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-3">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Answering the Primary Research Question
            </h4>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Definitive Resolution:</strong> Gradient-boosted decision trees equipped with hierarchical out-of-fold target encodings and calendar surge flags decisively outperform both historical baselines and linear alternatives.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Empirical Superiority:</strong> Achieves <strong className="text-emerald-600 dark:text-emerald-400 font-bold">$1,616.78 WMAE</strong> and <strong className="text-emerald-600 dark:text-emerald-400 font-bold">97.65% R²</strong> on an unpolluted 39-week holdout, cutting prediction error by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">33.3%</strong> over naive medians ($2,424.32) and <strong className="text-emerald-600 dark:text-emerald-400 font-bold">35.5%</strong> over Ridge regression ($2,508.61).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Holiday Parity:</strong> Resists holiday degradation with a near-parity error ratio of <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1.04x</strong>, in sharp contrast to lag baselines which degrade to 1.22x.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Metric Superiority
              </span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                $1,616.78 WMAE
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1">
                <li className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>33.3% error reduction</strong> vs. historical median ($2,424.32).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>35.5% error reduction</strong> vs. Ridge regression ($2,508.61).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Variance Explained
              </span>
              <div className="text-xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
                97.65% Holdout R²
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1">
                <li className="flex items-start gap-1">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">•</span>
                  <span>Generalizes across 45 physical stores and 81 departments.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">•</span>
                  <span>Captures complex spatio-temporal SKU-level demand baselines.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Holiday Robustness
              </span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                1.04x Holiday Ratio
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1">
                <li className="flex items-start gap-1">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Near-parity error ratio between holiday and non-holiday weeks.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Completely avoids the severe 1.22x lag baseline degradation.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
            <h5 className="font-bold text-zinc-900 dark:text-white text-sm">Key Architectural Learnings (Core Takeaways):</h5>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-zinc-950 dark:text-white">Hierarchical Priors Dominate Raw Identifiers:</strong> Replacing high-cardinality IDs with training-partition historical medians (<code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">sd_median</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">dw_median</code>) enables tree algorithms to generalize across unobserved cross-sections without overfitting.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-zinc-950 dark:text-white">Calendar Specificity Outperforms Coarse Indicators:</strong> Monolithic <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">IsHoliday</code> tags conflate minor holidays (+2% lift) with massive commercial surges (Thanksgiving: +45% lift; Pre-Christmas: +81% lift). Explicit ISO week surge indicators are indispensable.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-zinc-950 dark:text-white">Operational Asymmetry Alignment:</strong> Retail inventory stockout penalties ($1,750/unit) dwarf surplus holding overhead ($350/unit). Constraining tree depth (depth=10) and tuning objective metrics to operational cost matrices translates mathematical accuracy into multimillion-dollar supply chain gains.
                </div>
              </li>
            </ul>

            <h5 className="font-bold text-zinc-900 dark:text-white text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800">
              Executive Inventory Buffer Recommendations:
            </h5>
            <ul className="space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Type A Supercenters:</strong> Implement a dynamic +5% safety inventory buffer across high-turnover departments (Depts 72 &amp; 92) starting 2 weeks prior to Thanksgiving (Week 45).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Promotional Markdown Hygiene:</strong> Treat markdown columns strictly as predictive correlation markers rather than causal interventional knobs; do not artificially inflate markdown budgets assuming linear sales elasticity.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span><strong className="text-zinc-950 dark:text-white">Rolling Retraining Cadence:</strong> Schedule automated weekly retraining of target medians strictly within rolling 104-week historical windows to maintain zero forward lookahead leakage in production.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 12. REPRODUCTION & AUDIT PROTOCOL */}
      {/* ------------------------------------------------------------------ */}
      <section id="reproduction" className="space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Verification & Audit</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Reproduction & Execution Protocol</h3>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            To ensure complete academic transparency, strict scientific rigor, and technical auditability, this project is fully reproducible
            from raw Kaggle CSVs using deterministic random seeds (<code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">SEED = 42</code>).
            Supported natively across <strong>Windows</strong>, <strong>Linux</strong>, and <strong>macOS</strong>.
          </p>

          {/* System Requirements & Integrity Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                System & OS Requirements
              </span>
              <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 list-disc pl-4">
                <li><strong>Python:</strong> 3.10+ (Verified on Python 3.10, 3.11, 3.12, 3.14 x64/arm64)</li>
                <li><strong>Node.js:</strong> 18+ (Verified on Node v18, v20 LTS, v22)</li>
                <li><strong>Hardware:</strong> &ge; 8 GB RAM (for 100-tree RF & CatBoost RAM footprints)</li>
                <li><strong>Disk:</strong> ~250 MB (Raw CSVs, parquet partitions, model weights)</li>
                <li><strong>Toolchains:</strong> Git, Unzip / PowerShell, OpenMP (<code className="text-[11px] font-mono">libomp</code> on macOS, <code className="text-[11px] font-mono">libgomp1</code> on Linux)</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Dataset Integrity & Ground Truth Checksums
              </span>
              <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 list-disc pl-4 font-mono">
                <li><strong>train.csv:</strong> 421,570 rows (~12.8 MB) — 45 stores, 81 depts</li>
                <li><strong>features.csv:</strong> 8,190 rows (~0.59 MB) — CPI, Fuel, Markdowns</li>
                <li><strong>stores.csv:</strong> 45 rows (~532 bytes) — Store Format Type & Size</li>
                <li><strong>test.csv:</strong> 115,064 rows (~2.60 MB) — Unlabeled Kaggle test set</li>
              </ul>
              <div className="pt-1">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified with automated checksum checker: <code className="font-mono text-[10px]">python download_dataset.py --check</code>
                </span>
              </div>
            </div>
          </div>

          {/* Alternate Dataset Download Options */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Download size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Dataset Acquisition Options (Choose Preferred Method)</span>
              </h4>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Alternative options when Kaggle CLI is not configured
              </span>
            </div>

            {/* Option Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDownloadOpt("script")}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                  selectedDownloadOpt === "script"
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500/50 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-75">Option 1 (Recommended)</div>
                <div className="truncate">Automated Python Script</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDownloadOpt("kaggle_cli")}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                  selectedDownloadOpt === "kaggle_cli"
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500/50 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-75">Option 2 (Official)</div>
                <div className="truncate">Kaggle CLI & Token</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDownloadOpt("manual_browser")}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                  selectedDownloadOpt === "manual_browser"
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500/50 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-75">Option 3 (No Token)</div>
                <div className="truncate">Direct Web Download</div>
              </button>
            </div>

            {/* Option Details Card */}
            <div className="p-4 rounded-xl bg-zinc-900 dark:bg-black text-zinc-200 text-xs font-mono border border-zinc-800 space-y-2">
              {selectedDownloadOpt === "script" && (
                <div>
                  <div className="text-zinc-400 mb-1 flex items-center justify-between">
                    <span># Zero-configuration script: auto-extracts nested archives, invokes Kaggle API if present, or validates existing files</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("dl-script", "python download_dataset.py\npython download_dataset.py --check")}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 font-sans text-[11px]"
                    >
                      {copiedCodeKey === "dl-script" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedCodeKey === "dl-script" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="text-emerald-400 select-all">python download_dataset.py</div>
                  <div className="text-zinc-300 select-all">python download_dataset.py --check</div>
                  <div className="text-zinc-500 text-[11px] pt-1 font-sans">
                    Handles recursive extraction of nested archives (e.g., <code className="text-zinc-400">train.csv.zip</code>, <code className="text-zinc-400">features.csv.zip</code>) and verifies row counts automatically.
                  </div>
                </div>
              )}

              {selectedDownloadOpt === "kaggle_cli" && (
                <div>
                  <div className="text-zinc-400 mb-1 flex items-center justify-between">
                    <span># Official Kaggle CLI (Requires ~/.kaggle/kaggle.json or %USERPROFILE%\.kaggle\kaggle.json)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("dl-cli", "kaggle competitions download -c walmart-recruiting-store-sales-forecasting -p data/\npython download_dataset.py --extract-only")}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 font-sans text-[11px]"
                    >
                      {copiedCodeKey === "dl-cli" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedCodeKey === "dl-cli" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="text-emerald-400 select-all">kaggle competitions download -c walmart-recruiting-store-sales-forecasting -p data/</div>
                  <div className="text-zinc-300 select-all">python download_dataset.py --extract-only</div>
                  <div className="text-zinc-500 text-[11px] pt-1 font-sans">
                    Make sure you have clicked &quot;Late Submission&quot; or &quot;I Understand and Accept&quot; on the Kaggle competition page before running, otherwise Kaggle returns 403 Forbidden.
                  </div>
                </div>
              )}

              {selectedDownloadOpt === "manual_browser" && (
                <div>
                  <div className="text-zinc-400 mb-1 flex items-center justify-between">
                    <span># 100% credential-free direct download via web browser</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("dl-manual", "python download_dataset.py --extract-only\npython download_dataset.py --check")}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 font-sans text-[11px]"
                    >
                      {copiedCodeKey === "dl-manual" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedCodeKey === "dl-manual" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="text-zinc-400 font-sans leading-relaxed">
                    1. Navigate to: <a href="https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/data" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/data <ExternalLink size={11} /></a><br />
                    2. Click <strong>&quot;Download All&quot;</strong> to get <code className="text-zinc-200">walmart-recruiting-store-sales-forecasting.zip</code> (~15 MB).<br />
                    3. Place the downloaded ZIP file directly inside this project&apos;s <code className="text-emerald-400">data/</code> directory.<br />
                    4. Run the helper to unpack and verify:
                  </div>
                  <div className="text-emerald-400 select-all pt-1">python download_dataset.py --extract-only</div>
                  <div className="text-zinc-300 select-all">python download_dataset.py --check</div>
                </div>
              )}
            </div>
          </div>

          {/* OS-Specific Execution Stepper */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Operating System Execution Protocols</span>
              </h4>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Switch OS for tailored shell commands &amp; launch scripts
              </span>
            </div>

            {/* OS Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedReproOs("windows")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  selectedReproOs === "windows"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Laptop size={13} />
                <span>Windows (PowerShell / CMD)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReproOs("linux")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  selectedReproOs === "linux"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Server size={13} />
                <span>Linux (Ubuntu / Debian / RHEL)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReproOs("macos")}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  selectedReproOs === "macos"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Laptop size={13} />
                <span>macOS (Apple Silicon &amp; Intel)</span>
              </button>
            </div>

            {/* Shell Code Display */}
            <div className="p-4 rounded-xl bg-zinc-950 dark:bg-black text-zinc-100 font-mono text-xs overflow-x-auto space-y-4 border border-zinc-800 relative">
              {/* Copy Full OS Script Button */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[11px] text-zinc-400">
                  Target: {selectedReproOs === "windows" ? "PowerShell 5.1 / 7+" : selectedReproOs === "linux" ? "Bash / Sh (Linux)" : "Zsh / Bash (macOS)"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    let cmdText = "";
                    if (selectedReproOs === "windows") {
                      cmdText = `git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git\ncd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\npython download_dataset.py\npython training_pipeline.py\npython build_models_and_predictions.py\npython generate_results_json.py\n.\\run_portal.bat`;
                    } else if (selectedReproOs === "linux") {
                      cmdText = `sudo apt update && sudo apt install -y python3-venv python3-pip build-essential libgomp1 unzip\ngit clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git\ncd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department\npython3 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\npython3 download_dataset.py\npython3 training_pipeline.py\npython3 build_models_and_predictions.py\npython3 generate_results_json.py\nchmod +x run_portal.sh\n./run_portal.sh`;
                    } else {
                      cmdText = `brew install python@3.11 node libomp unzip\ngit clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git\ncd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department\npython3 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\npython3 download_dataset.py\npython3 training_pipeline.py\npython3 build_models_and_predictions.py\npython3 generate_results_json.py\nchmod +x run_portal.sh\n./run_portal.sh`;
                    }
                    handleCopyCode(`full-${selectedReproOs}`, cmdText);
                  }}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] font-sans"
                >
                  {copiedCodeKey === `full-${selectedReproOs}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCodeKey === `full-${selectedReproOs}` ? "All Copied!" : "Copy All Commands"}</span>
                </button>
              </div>

              {/* WINDOWS SCRIPT */}
              {selectedReproOs === "windows" && (
                <>
                  <div>
                    <span className="text-zinc-500 select-none"># 1. Clone repository &amp; activate virtual environment</span>
                    <div className="text-zinc-200 select-all">git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git</div>
                    <div className="text-zinc-200 select-all">cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department</div>
                    <div className="text-zinc-200 select-all">python -m venv venv</div>
                    <div className="text-zinc-200 select-all">.\venv\Scripts\Activate.ps1  <span className="text-zinc-500"># In CMD: venv\Scripts\activate.bat</span></div>
                    <div className="text-zinc-500 text-[11px]"># If PowerShell execution policy restricts scripts: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</div>
                    <div className="text-zinc-200 select-all">pip install -r requirements.txt</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 2. Ingest &amp; unpack dataset (uses selected method)</span>
                    <div className="text-emerald-400 select-all">python download_dataset.py</div>
                    <div className="text-zinc-300 select-all">python download_dataset.py --check</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 3. Execute deterministic ML pipeline &amp; generate predictions</span>
                    <div className="text-emerald-400 select-all">python training_pipeline.py</div>
                    <div className="text-zinc-200 select-all">python build_models_and_predictions.py</div>
                    <div className="text-zinc-200 select-all">python generate_results_json.py</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 4. Launch Model Server &amp; Next.js Portal (Unified Launcher)</span>
                    <div className="text-emerald-400 select-all">.\run_portal.bat  <span className="text-zinc-500"># Runs background Python model server on :5001 &amp; Next.js portal on :3000</span></div>
                  </div>
                </>
              )}

              {/* LINUX SCRIPT */}
              {selectedReproOs === "linux" && (
                <>
                  <div>
                    <span className="text-zinc-500 select-none"># 1. Install prerequisites (Debian/Ubuntu) &amp; clone</span>
                    <div className="text-zinc-200 select-all">sudo apt update &amp;&amp; sudo apt install -y python3-venv python3-pip build-essential libgomp1 unzip nodejs npm</div>
                    <div className="text-zinc-200 select-all">git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git</div>
                    <div className="text-zinc-200 select-all">cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department</div>
                    <div className="text-zinc-200 select-all">python3 -m venv venv &amp;&amp; source venv/bin/activate</div>
                    <div className="text-zinc-200 select-all">pip install --upgrade pip &amp;&amp; pip install -r requirements.txt</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 2. Ingest dataset &amp; verify integrity</span>
                    <div className="text-emerald-400 select-all">python3 download_dataset.py</div>
                    <div className="text-zinc-300 select-all">python3 download_dataset.py --check</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 3. Train models &amp; compile single-source portal results</span>
                    <div className="text-emerald-400 select-all">python3 training_pipeline.py</div>
                    <div className="text-zinc-200 select-all">python3 build_models_and_predictions.py</div>
                    <div className="text-zinc-200 select-all">python3 generate_results_json.py</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 4. Launch unified Model Server &amp; Next.js Portal</span>
                    <div className="text-emerald-400 select-all">chmod +x run_portal.sh &amp;&amp; ./run_portal.sh</div>
                    <span className="text-zinc-500 text-[11px]"># Automatically starts model_server.py (5001) in background with graceful SIGINT cleanup</span>
                  </div>
                </>
              )}

              {/* MACOS SCRIPT */}
              {selectedReproOs === "macos" && (
                <>
                  <div>
                    <span className="text-zinc-500 select-none"># 1. Install prerequisites via Homebrew (libomp is required for XGBoost/LightGBM)</span>
                    <div className="text-zinc-200 select-all">brew install python@3.11 node libomp unzip</div>
                    <div className="text-zinc-200 select-all">git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git</div>
                    <div className="text-zinc-200 select-all">cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department</div>
                    <div className="text-zinc-200 select-all">python3 -m venv venv &amp;&amp; source venv/bin/activate</div>
                    <div className="text-zinc-200 select-all">pip install --upgrade pip &amp;&amp; pip install -r requirements.txt</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 2. Ingest dataset &amp; verify integrity</span>
                    <div className="text-emerald-400 select-all">python3 download_dataset.py</div>
                    <div className="text-zinc-300 select-all">python3 download_dataset.py --check</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 3. Train models &amp; compile single-source portal results</span>
                    <div className="text-emerald-400 select-all">python3 training_pipeline.py</div>
                    <div className="text-zinc-200 select-all">python3 build_models_and_predictions.py</div>
                    <div className="text-zinc-200 select-all">python3 generate_results_json.py</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 select-none"># 4. Launch unified Model Server &amp; Next.js Portal</span>
                    <div className="text-emerald-400 select-all">chmod +x run_portal.sh &amp;&amp; ./run_portal.sh</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 13. AI-USE DISCLOSURE & CITATIONS */}
      {/* ------------------------------------------------------------------ */}
      <section id="disclosure" className="space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Course Policy Compliance</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">AI-Use Disclosure & Academic References</h3>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-zinc-900 dark:text-zinc-100" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Formal AI Assistance Disclosure (ES 335 Policy)
              </h4>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              In accordance with the ES 335 / ES 678 course policy regarding generative tools, the team declares the following use of AI assistance:
            </p>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-zinc-950 dark:text-white">Tooling Employed:</strong> Anthropic Claude 3.5 Sonnet and Antigravity AI coding agent.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-white">Permitted Scope:</strong> Brainstorming interactive UI layout abstractions, writing TypeScript interfaces for <code className="font-mono text-[11px]">results.json</code>, generating Tailwind utility class skeletons, and drafting automated sanity-check test suites.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-white">Human Authorship & Independent Verification:</strong> All underlying machine-learning formulations, chronological leakage firewalls, statistical encoding formulas, Optuna loss configurations, WMAE validation calculations, and final qualitative conclusions were devised, executed, and independently audited by the team members. No private student credentials or unpermitted data were exposed.
              </li>
            </ul>
          </div>

          {/* Academic Bibliography */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Academic References & Software Citations
            </h4>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Chen, T., & Guestrin, C. (2016).</span> XGBoost: A Scalable Tree Boosting System. In <em>Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining</em> (pp. 785-794).
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Ke, G., Meng, Q., Finley, T., et al. (2017).</span> LightGBM: A Highly Efficient Gradient Boosting Decision Tree. In <em>Advances in Neural Information Processing Systems (NeurIPS 2017)</em> (Vol. 30).
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Prokhorenkova, L., Gusev, G., Vorobev, A., et al. (2018).</span> CatBoost: unbiased boosting with categorical features. In <em>Advances in Neural Information Processing Systems (NeurIPS 2018)</em> (Vol. 31).
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Akiba, T., Sano, S., Yanase, T., et al. (2019).</span> Optuna: A Next-generation Hyperparameter Optimization Framework. In <em>Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining</em> (pp. 2623-2631).
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Pedregosa, F., Varoquaux, G., Gramfort, A., et al. (2011).</span> Scikit-learn: Machine Learning in Python. <em>Journal of Machine Learning Research (JMLR)</em>, 12, 2825-2830.
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Walmart Inc. / Kaggle. (2014).</span> Walmart Recruiting - Store Sales Forecasting: Historical sales data for 45 Walmart stores located in different regions. Kaggle Competition.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
