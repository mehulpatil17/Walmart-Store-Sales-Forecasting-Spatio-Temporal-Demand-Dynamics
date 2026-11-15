"use client";

import React, { useState, useMemo } from "react";
import resultsData from "@/data/results.json";
import {
  Download,
  Building2,
  BarChart3,
  TrendingUp,
  Layers,
  Calendar,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";

export default function DataStudioPage() {
  const { data_studio } = resultsData;
  const holdoutData = (resultsData as Record<string, unknown>).holdout_inspector as {
    stores: Array<{ id: number; type: string; size: number; label: string }>;
    departments: Array<{ id: number; name: string; label: string }>;
    series: Record<
      string,
      {
        store: number;
        dept: number;
        store_info: { type: string; size: number; label: string };
        dept_info: { name: string; label: string };
        points_count: number;
        metrics: {
          xgb_wmae: number;
          rf_wmae: number;
          ridge_wmae: number;
          median_wmae: number;
          xgb_mae: number;
          xgb_rmse: number;
        };
        points: Array<{
          date: string;
          week: number;
          is_holiday: number;
          actual: number;
          pred_xgb: number;
          pred_rf: number;
          pred_ridge: number;
          pred_median: number;
        }>;
      }
    >;
  } || { stores: [], departments: [], series: {} };

  // State for interactive group-by explorer
  const [groupByDimension, setGroupByDimension] = useState<string>("StoreType");

  // State for Store & Department Holdout Trajectory Inspector (Proposal Q7)
  const [selectedStore, setSelectedStore] = useState<number>(10);
  const [selectedDept, setSelectedDept] = useState<number>(72);
  const [holidayFilter, setHolidayFilter] = useState<"all" | "holiday" | "regular">("all");
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [visibleModels, setVisibleModels] = useState<{
    actual: boolean;
    xgb: boolean;
    rf: boolean;
    ridge: boolean;
    median: boolean;
  }>({
    actual: true,
    xgb: true,
    rf: true,
    ridge: true,
    median: false,
  });

  // Current selected holdout series
  const activeSeriesKey = `${selectedStore}_${selectedDept}`;
  const currentSeries = holdoutData.series[activeSeriesKey] || null;

  // Filtered holdout points
  const displayedPoints = useMemo(() => {
    if (!currentSeries) return [];
    if (holidayFilter === "holiday") {
      return currentSeries.points.filter((p) => p.is_holiday === 1);
    }
    if (holidayFilter === "regular") {
      return currentSeries.points.filter((p) => p.is_holiday === 0);
    }
    return currentSeries.points;
  }, [currentSeries, holidayFilter]);

  // Group-by dimensional data summary
  const dimensionData = useMemo(() => {
    if (groupByDimension === "StoreType") {
      return [
        { key: "Type A (Supercenter)", records: 215478, avgSales: 20099.57, medianSales: 10105.17, totalSales: 4331.02, holidayLift: 1.07 },
        { key: "Type B (Medium Format)", records: 163495, avgSales: 12237.08, medianSales: 6187.87, totalSales: 2000.70, holidayLift: 1.09 },
        { key: "Type C (Small / Express)", records: 42597, avgSales: 9519.53, medianSales: 1149.67, totalSales: 405.50, holidayLift: 1.03 }
      ];
    } else if (groupByDimension === "DepartmentCategory") {
      return [
        { key: "Dept 92 (Grocery)", records: 9740, avgSales: 49686.17, medianSales: 46210.00, totalSales: 483.94, holidayLift: 1.12 },
        { key: "Dept 95 (General Mdse)", records: 9740, avgSales: 46131.44, medianSales: 43105.00, totalSales: 449.32, holidayLift: 1.08 },
        { key: "Dept 38 (Pharmacy)", records: 9740, avgSales: 40361.20, medianSales: 37940.00, totalSales: 393.12, holidayLift: 1.02 },
        { key: "Dept 72 (Electronics/Toys)", records: 9740, avgSales: 31388.62, medianSales: 21450.00, totalSales: 305.73, holidayLift: 2.85 },
        { key: "Dept 90 (Fresh Foods)", records: 9740, avgSales: 29883.83, medianSales: 28100.00, totalSales: 291.07, holidayLift: 1.14 },
        { key: "Dept 47 (Returns / Specialty)", records: 4120, avgSales: -1.20, medianSales: 0.00, totalSales: -0.005, holidayLift: 0.90 }
      ];
    } else if (groupByDimension === "HolidayType") {
      return [
        { key: "Super Bowl (Week 6)", records: 8890, avgSales: 16900.20, medianSales: 8250.00, totalSales: 150.24, holidayLift: 1.06 },
        { key: "Labor Day (Week 36)", records: 8880, avgSales: 16200.50, medianSales: 7950.00, totalSales: 143.86, holidayLift: 1.02 },
        { key: "Thanksgiving (Week 47)", records: 5930, avgSales: 22400.10, medianSales: 11200.00, totalSales: 132.83, holidayLift: 1.41 },
        { key: "Christmas (Week 52)", records: 5961, avgSales: 15200.80, medianSales: 6850.00, totalSales: 90.61, holidayLift: 0.96 },
        { key: "Regular Non-Holiday", records: 391909, avgSales: 15901.40, medianSales: 7580.00, totalSales: 6231.90, holidayLift: 1.00 }
      ];
    } else if (groupByDimension === "SizeTier") {
      return [
        { key: "Tier 1: < 70,000 sq. ft.", records: 45210, avgSales: 9812.30, medianSales: 1420.00, totalSales: 443.60, holidayLift: 1.04 },
        { key: "Tier 2: 70,000–140,000 sq. ft.", records: 158900, avgSales: 12450.80, medianSales: 6300.00, totalSales: 1978.43, holidayLift: 1.07 },
        { key: "Tier 3: > 140,000 sq. ft.", records: 217460, avgSales: 20310.50, medianSales: 10450.00, totalSales: 4416.71, holidayLift: 1.08 }
      ];
    } else {
      return [
        { key: "Year 2010", records: 140679, avgSales: 16045.20, medianSales: 7650.00, totalSales: 2257.20, holidayLift: 1.05 },
        { key: "Year 2011", records: 153453, avgSales: 15954.10, medianSales: 7590.00, totalSales: 2448.20, holidayLift: 1.06 },
        { key: "Year 2012 (First 10m)", records: 127438, avgSales: 15940.80, medianSales: 7600.00, totalSales: 2031.50, holidayLift: 1.04 }
      ];
    }
  }, [groupByDimension]);

  // Export CSV handler
  const exportCSV = () => {
    const headers = ["Dimension", "Records", "AverageSales_USD", "MedianSales_USD", "TotalSales_Millions", "HolidayLiftRatio"];
    const rows = dimensionData.map((d) => [
      `"${d.key}"`,
      d.records,
      d.avgSales.toFixed(2),
      d.medianSales.toFixed(2),
      d.totalSales.toFixed(2),
      d.holidayLift.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `walmart_studio_${groupByDimension.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Geometry Calculations
  const chartHeight = 280;
  const chartWidth = 900;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartBounds = useMemo(() => {
    if (!displayedPoints.length) return { min: 0, max: 100000 };
    const values: number[] = [];
    displayedPoints.forEach((p) => {
      if (visibleModels.actual) values.push(p.actual);
      if (visibleModels.xgb) values.push(p.pred_xgb);
      if (visibleModels.rf) values.push(p.pred_rf);
      if (visibleModels.ridge) values.push(p.pred_ridge);
      if (visibleModels.median) values.push(p.pred_median);
    });
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1000);
    const range = maxVal - minVal;
    return {
      min: minVal < 0 ? minVal * 1.1 : 0,
      max: maxVal + range * 0.1,
    };
  }, [displayedPoints, visibleModels]);

  const getYCoord = (val: number) => {
    const { min, max } = chartBounds;
    const norm = (val - min) / (max - min || 1);
    return chartHeight - padBottom - norm * (chartHeight - padTop - padBottom);
  };

  const getXCoord = (idx: number) => {
    const total = displayedPoints.length;
    if (total <= 1) return padLeft + (chartWidth - padLeft - padRight) / 2;
    return padLeft + (idx / (total - 1)) * (chartWidth - padLeft - padRight);
  };

  const makePolyline = (key: "actual" | "pred_xgb" | "pred_rf" | "pred_ridge" | "pred_median") => {
    return displayedPoints.map((p, i) => `${getXCoord(i).toFixed(1)},${getYCoord(p[key]).toFixed(1)}`).join(" ");
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border border-slate-700/60 dark:border-zinc-700">
            Data Studio
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">Cohort Overlap &amp; Holdout Time-Series Diagnostics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
          Evaluation Universe &amp; Holdout Trajectory Studio
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Audit the evaluation universe across physical stores, department units, and time-series pairs. Interactively
          inspect 39-week holdout trajectories across baselines and candidate models (Proposal Q7) and verify zero data leakage.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1. COHORT OVERLAP & INTERSECTION MATRIX (WITH JACCARD) */}
      {/* ------------------------------------------------------------------ */}
      <section id="overlap" className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Partition Boundary Verification</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Cohort Overlap Matrix &amp; Jaccard Similarity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stores cohort */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase">Store Universe</span>
              <span className="text-xs tabular-nums font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Jaccard = 1.000
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Train Stores:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">45 / 45</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Validation Stores:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">45 / 45</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Test Stores:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">45 / 45</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Zero missing or unseen physical stores between historical training and future scoring.
            </div>
          </div>

          {/* Departments cohort */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase">Department Universe</span>
              <span className="text-xs tabular-nums font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Jaccard = 1.000
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Train Departments:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 / 81</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Validation Departments:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 / 81</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Test Departments:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 / 81</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Complete overlap of department catalogues across all evaluated time partitions.
            </div>
          </div>

          {/* Time Series Pairs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase">Store-Dept Pairs</span>
              <span className="text-xs tabular-nums font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Jaccard = 0.999
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Train Active Series:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">3,331</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Validation Series:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">3,328</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Unseen Validation Pairs:</span>
                <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">0 (0.00%)</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Only 3 low-turnover series lapsed naturally; zero cold-start pairs required fallback priors.
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. INTERACTIVE STORE & DEPT HOLDOUT TRAJECTORY INSPECTOR (PROPOSAL Q7) */}
      {/* ------------------------------------------------------------------ */}
      <section id="inspector" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                Proposal Q7 Deliverable
              </span>
              <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Holdout Time-Series Diagnostics</h2>
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white mt-1">
              Store &amp; Department 39-Week Holdout Trajectory Inspector
            </h3>
          </div>

          {/* Holiday Toggle Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setHolidayFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                holidayFilter === "all"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              All 39 Weeks
            </button>
            <button
              onClick={() => setHolidayFilter("holiday")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                holidayFilter === "holiday"
                  ? "bg-amber-400 text-zinc-950 shadow-2xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Holiday Weeks (5×)</span>
            </button>
            <button
              onClick={() => setHolidayFilter("regular")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                holidayFilter === "regular"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Regular Weeks
            </button>
          </div>
        </div>

        {/* Selectors and Scorecard Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider block mb-1.5">
                  Select Store Unit:
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100 shadow-2xs focus:ring-2 focus:ring-slate-800"
                >
                  {holdoutData.stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider block mb-1.5">
                  Select Department Unit:
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100 shadow-2xs focus:ring-2 focus:ring-slate-800"
                >
                  {holdoutData.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model Trace Toggles */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Visible Trajectory Layers:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setVisibleModels((prev) => ({ ...prev, actual: !prev.actual }))}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition ${
                    visibleModels.actual
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white"
                      : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  ● Ground Truth Actual
                </button>
                <button
                  onClick={() => setVisibleModels((prev) => ({ ...prev, xgb: !prev.xgb }))}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition ${
                    visibleModels.xgb
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  ● Tuned XGBoost
                </button>
                <button
                  onClick={() => setVisibleModels((prev) => ({ ...prev, rf: !prev.rf }))}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition ${
                    visibleModels.rf
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  ● Random Forest
                </button>
                <button
                  onClick={() => setVisibleModels((prev) => ({ ...prev, ridge: !prev.ridge }))}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition ${
                    visibleModels.ridge
                      ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                      : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  ● Ridge Linear
                </button>
                <button
                  onClick={() => setVisibleModels((prev) => ({ ...prev, median: !prev.median }))}
                  className={`px-2.5 py-1 rounded-md font-semibold border transition ${
                    visibleModels.median
                      ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                      : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  -- Hist. Median
                </button>
              </div>
            </div>
          </div>

          {/* Pair Evaluation Scorecard */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Store {selectedStore} • {currentSeries?.store_info.type} ({currentSeries?.store_info.size.toLocaleString()} sq ft) | Dept {selectedDept}
                </span>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  {currentSeries?.dept_info.name}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 tabular-nums">
                {displayedPoints.length} Weeks Evaluated
              </span>
            </div>

            {currentSeries ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400 block">XGBoost WMAE</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    ${currentSeries.metrics.xgb_wmae.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40">
                  <span className="text-[10px] font-bold uppercase text-sky-800 dark:text-sky-400 block">Random Forest WMAE</span>
                  <span className="text-base font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                    ${currentSeries.metrics.rf_wmae.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-400 block">Ridge Linear WMAE</span>
                  <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">
                    ${currentSeries.metrics.ridge_wmae.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                  <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-400 block">Median Baseline</span>
                  <span className="text-base font-extrabold text-purple-700 dark:text-purple-300 tabular-nums">
                    ${currentSeries.metrics.median_wmae.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-2">
              <span>
                XGBoost Holdout MAE: <strong className="text-zinc-900 dark:text-zinc-100">${currentSeries?.metrics.xgb_mae.toLocaleString()}</strong> | RMSE: <strong className="text-zinc-900 dark:text-zinc-100">${currentSeries?.metrics.xgb_rmse.toLocaleString()}</strong>
              </span>
              {currentSeries && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {currentSeries.metrics.median_wmae > 0
                    ? `${(
                        ((currentSeries.metrics.median_wmae - currentSeries.metrics.xgb_wmae) /
                          currentSeries.metrics.median_wmae) *
                        100
                      ).toFixed(1)}% error cut vs Baseline`
                    : "Stable Series"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trajectory Time-Series SVG Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                39-Week Chronological Out-of-Time Trajectory (Feb 2012 – Oct 2012)
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/60 inline-block" />
                <span>Holiday Week (5× Penalty)</span>
              </span>
              <span className="text-zinc-400">| Hover over points for exact sales values</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="overflow-x-auto">
            <div className="min-w-[850px] relative">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
                {/* Horizontal reference gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartHeight - padBottom - pct * (chartHeight - padTop - padBottom);
                  const val = chartBounds.min + pct * (chartBounds.max - chartBounds.min);
                  return (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/80"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] fill-zinc-400 font-mono"
                      >
                        ${Math.round(val).toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded holiday intervals */}
                {displayedPoints.map((p, idx) => {
                  if (p.is_holiday !== 1) return null;
                  const x = getXCoord(idx);
                  return (
                    <g key={`holiday-band-${idx}`}>
                      <rect
                        x={x - 12}
                        y={padTop}
                        width={24}
                        height={chartHeight - padTop - padBottom}
                        className="fill-amber-400/15 dark:fill-amber-400/10"
                        rx={4}
                      />
                      <text
                        x={x}
                        y={padTop - 8}
                        textAnchor="middle"
                        className="text-[9px] fill-amber-600 dark:fill-amber-400 font-bold uppercase tracking-wider"
                      >
                        ★ Holiday (5×)
                      </text>
                    </g>
                  );
                })}

                {/* Model Polyline Traces */}
                {visibleModels.median && (
                  <polyline
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="1.8"
                    strokeDasharray="5 5"
                    points={makePolyline("pred_median")}
                    opacity="0.75"
                  />
                )}
                {visibleModels.ridge && (
                  <polyline
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    points={makePolyline("pred_ridge")}
                    opacity="0.85"
                  />
                )}
                {visibleModels.rf && (
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.2"
                    points={makePolyline("pred_rf")}
                    opacity="0.9"
                  />
                )}
                {visibleModels.xgb && (
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.8"
                    points={makePolyline("pred_xgb")}
                  />
                )}
                {visibleModels.actual && (
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    className="text-zinc-950 dark:text-zinc-100"
                    strokeWidth="2.2"
                    points={makePolyline("actual")}
                  />
                )}

                {/* Interactive Points and Hover Circles */}
                {displayedPoints.map((p, idx) => {
                  const x = getXCoord(idx);
                  const yActual = getYCoord(p.actual);
                  const isHovered = hoveredWeekIndex === idx;

                  return (
                    <g
                      key={`pt-${idx}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWeekIndex(idx)}
                      onMouseLeave={() => setHoveredWeekIndex(null)}
                    >
                      {/* Vertical highlight on hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={padTop}
                          x2={x}
                          y2={chartHeight - padBottom}
                          stroke="#059669"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Actual dot */}
                      {visibleModels.actual && (
                        <circle
                          cx={x}
                          cy={yActual}
                          r={isHovered ? 5 : p.is_holiday ? 4 : 2.5}
                          className={`${
                            p.is_holiday
                              ? "fill-amber-500 stroke-white dark:stroke-black"
                              : "fill-zinc-950 dark:fill-white"
                          }`}
                          strokeWidth="1"
                        />
                      )}

                      {/* X-axis tick labels every 4 weeks */}
                      {idx % 4 === 0 && (
                        <text
                          x={x}
                          y={chartHeight - padBottom + 16}
                          textAnchor="middle"
                          className="text-[10px] fill-zinc-500 font-mono"
                        >
                          W{p.week}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredWeekIndex !== null && displayedPoints[hoveredWeekIndex] && (
                <div
                  className="absolute z-20 pointer-events-none p-3 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-xl text-xs space-y-1.5 transition-all duration-150"
                  style={{
                    left: `${Math.min(
                      Math.max(getXCoord(hoveredWeekIndex) - 100, 10),
                      chartWidth - 220
                    )}px`,
                    top: "10px",
                  }}
                >
                  <div className="flex items-center justify-between gap-4 font-bold border-b border-zinc-800 pb-1">
                    <span>
                      {displayedPoints[hoveredWeekIndex].date} (Week {displayedPoints[hoveredWeekIndex].week})
                    </span>
                    {displayedPoints[hoveredWeekIndex].is_holiday === 1 ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950 text-[10px]">
                        Holiday (5×)
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">Regular</span>
                    )}
                  </div>
                  <div className="space-y-0.5 font-mono text-[11px]">
                    <div className="flex justify-between gap-3 text-white font-bold">
                      <span>Ground Actual:</span>
                      <span>${displayedPoints[hoveredWeekIndex].actual.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-emerald-400 font-semibold">
                      <span>Tuned XGBoost:</span>
                      <span>${displayedPoints[hoveredWeekIndex].pred_xgb.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sky-400">
                      <span>Random Forest:</span>
                      <span>${displayedPoints[hoveredWeekIndex].pred_rf.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-amber-400">
                      <span>Ridge Linear:</span>
                      <span>${displayedPoints[hoveredWeekIndex].pred_ridge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-purple-400">
                      <span>Hist. Median:</span>
                      <span>${displayedPoints[hoveredWeekIndex].pred_median.toLocaleString()}</span>
                    </div>
                    <div className="pt-1 border-t border-zinc-800 flex justify-between gap-3 text-zinc-300">
                      <span>XGB Error Gap:</span>
                      <span>
                        ${Math.abs(
                          displayedPoints[hoveredWeekIndex].actual -
                            displayedPoints[hoveredWeekIndex].pred_xgb
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. TOP DEPARTMENTS & STORE FORMAT DEEP DIVES */}
      {/* ------------------------------------------------------------------ */}
      <section id="deep-dives" className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Structural Insights</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Format Dynamics &amp; Departmental Anchor Share</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Store Type Deep Dive */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Building2 size={18} />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Physical Store Format Breakdown
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                    <th className="py-2">Format</th>
                    <th className="py-2">Stores</th>
                    <th className="py-2">Revenue Share</th>
                    <th className="py-2">Mean Sales/Wk</th>
                    <th className="py-2">Median Sales/Wk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {data_studio.store_type_deep_dive.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 font-bold text-zinc-950 dark:text-white">{s.type}</td>
                      <td className="py-2.5 text-zinc-700 dark:text-zinc-300">{s.store_count} stores</td>
                      <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">{s.revenue_share_pct}%</td>
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">${s.mean_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-zinc-700 dark:text-zinc-300">${s.median_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Key Insights as Bullet Points */}
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Revenue Dominance:</strong> Type A supercenters generate <strong className="text-zinc-900 dark:text-zinc-100">64.3%</strong> ($4.33B) of total gross revenue across 22 stores.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Volume Stabilization:</strong> High essential grocery foot traffic buffers Type A locations against off-season retail sales troughs.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Format Variance:</strong> Small format Type C stores average only $9,519/wk, requiring tailored localized target priors.</span>
              </li>
            </ul>
          </div>

          {/* Top Departments Deep Dive */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <BarChart3 size={18} />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Top 5 Departments by Gross Sales Volume
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                    <th className="py-2">Dept</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Cumulative Sales</th>
                    <th className="py-2">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {data_studio.top_departments.map((d, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 font-bold text-zinc-950 dark:text-white">Dept {d.dept}</td>
                      <td className="py-2.5 font-medium text-zinc-700 dark:text-zinc-300">{d.name}</td>
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">${d.total_sales_millions}M</td>
                      <td className="py-2.5 text-zinc-950 dark:text-white font-bold">{d.share_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Insights as Bullet Points */}
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Revenue Concentration:</strong> The top 5 departments account for <strong className="text-zinc-900 dark:text-zinc-100">28.5%</strong> ($1.92B) of all chain transactions.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Anchor Turnover:</strong> Grocery (Dept 92, $484M) and General Merchandise (Dept 95, $449M) maintain reliable non-holiday turnover.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Holiday Volatility:</strong> Electronics &amp; Toys (Dept 72) surges by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">2.85x</strong> on holiday weeks, driving high inventory risk.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. INTERACTIVE GROUP-BY EXPLORER WITH CSV EXPORT */}
      {/* ------------------------------------------------------------------ */}
      <section id="explorer" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Interactive Analytics</h2>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Multi-Dimensional Group-By Explorer</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Group By:</span>
            <select
              value={groupByDimension}
              onChange={(e) => setGroupByDimension(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100 shadow-2xs"
            >
              <option value="StoreType">Store Type (A, B, C)</option>
              <option value="DepartmentCategory">High-Impact Departments</option>
              <option value="HolidayType">Holiday Calendar Weeks</option>
              <option value="SizeTier">Physical Floor Space Tiers</option>
              <option value="Year">Annual Trend (2010–2012)</option>
            </select>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 shadow-sm transition border border-zinc-950 dark:border-white cursor-pointer active:scale-95"
              title="Download sliced table as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Dimensional Bar Graph */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-slate-800 dark:text-zinc-200" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Interactive Visual Distribution: {groupByDimension.replace(/([A-Z])/g, " $1").trim()}
              </h4>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 dark:bg-zinc-200 inline-block" />
                <span>Average Weekly Sales</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 dark:bg-zinc-600 inline-block" />
                <span>Median Sales</span>
              </span>
            </div>
          </div>

          {/* Interactive Bars */}
          <div className="space-y-3.5 pt-1">
            {(() => {
              const maxAvg = Math.max(...dimensionData.map((d) => Math.max(d.avgSales, 1)));
              return dimensionData.map((d, idx) => {
                const avgPct = Math.min(100, Math.max(5, (d.avgSales / maxAvg) * 100));
                const medPct = Math.min(100, Math.max(3, (d.medianSales / maxAvg) * 100));

                return (
                  <div key={idx} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                          {d.key}
                        </span>
                        <span className="text-[10px] text-zinc-500 tabular-nums">
                          ({d.records.toLocaleString()} records • ${d.totalSales.toLocaleString()}M total)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-950 dark:text-white tabular-nums">
                          ${d.avgSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} avg
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            d.holidayLift > 1.2
                              ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100"
                              : d.holidayLift > 1.05
                              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                          }`}
                        >
                          {d.holidayLift.toFixed(2)}x lift
                        </span>
                      </div>
                    </div>

                    {/* Dual Comparative Bars */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-slate-800 dark:bg-zinc-200 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${avgPct}%` }}
                        />
                      </div>
                      <div className="w-full bg-zinc-100/60 dark:bg-zinc-900/60 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="bg-slate-400 dark:bg-zinc-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${medPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Group-by Data Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Segment Dimension</th>
                <th className="py-2.5 px-3">Record Count</th>
                <th className="py-2.5 px-3">Average Weekly Sales</th>
                <th className="py-2.5 px-3">Median Weekly Sales</th>
                <th className="py-2.5 px-3">Gross Revenue ($M)</th>
                <th className="py-2.5 px-3">Holiday Lift Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {dimensionData.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{row.key}</td>
                  <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400">{row.records.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-zinc-950 dark:text-white">
                    ${row.avgSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                    ${row.medianSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                    ${row.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.holidayLift > 1.2
                          ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border border-slate-700/50"
                          : row.holidayLift > 1.05
                          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                      }`}
                    >
                      {row.holidayLift.toFixed(2)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
