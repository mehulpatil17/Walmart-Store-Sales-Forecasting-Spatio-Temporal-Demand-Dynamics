"use client";

import React, { useState, useMemo } from "react";
import resultsData from "@/data/results.json";
import {
  Download,
  Building2,
  BarChart3
} from "lucide-react";

export default function DataStudioPage() {
  const { data_studio } = resultsData;

  // State for interactive group-by explorer
  const [groupByDimension, setGroupByDimension] = useState<string>("StoreType");

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

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border border-slate-700/60 dark:border-zinc-700">
            Data Studio
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">Cohort Overlap & Multi-Dimensional Slicing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
          Evaluation Universe & Cohort Matrix
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Audit the evaluation universe across physical stores, department units, and time-series pairs. Verify zero
          data leakage across partitions and analyze cohort intersection metrics.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1. COHORT OVERLAP & INTERSECTION MATRIX (WITH JACCARD) */}
      {/* ------------------------------------------------------------------ */}
      <section id="overlap" className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Partition Boundary Verification</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Cohort Overlap Matrix & Jaccard Similarity</h3>
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
                <span className="text-zinc-500 dark:text-zinc-400">Train Active Depts:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 Depts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Validation Depts:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 Depts</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Test Depts:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">81 Depts</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Department categories remain identical; no novel product classes introduced in holdout.
            </div>
          </div>

          {/* Store-Dept Series cohort (Cold Start Audit) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase">Time-Series Pairs</span>
              <span className="text-xs tabular-nums font-bold px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Jaccard = 0.951
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Train Unique Series:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">3,331 Series</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Test Unique Series:</span>
                <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">3,169 Series</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Cold-Start Series in Test:</span>
                <span className="tabular-nums font-bold text-amber-600 dark:text-amber-400">11 Pairs (36 rows)</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Hierarchical fallback chain guarantees zero unhandled NaNs on cold-start test pairs.
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. DOMAIN DEEP-DIVES */}
      {/* ------------------------------------------------------------------ */}
      <section id="deep-dives" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Category Analysis</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Domain Deep-Dives: Stores & Top Departments</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Format Deep Dive */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Building2 size={18} />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Store Type Architecture (A vs B vs C)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                    <th className="py-2">Type</th>
                    <th className="py-2">Stores</th>
                    <th className="py-2">Mean Sales</th>
                    <th className="py-2">Median Sales</th>
                    <th className="py-2">Revenue Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {data_studio.store_type_deep_dive.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">{s.type}</td>
                      <td className="py-2.5 text-zinc-600 dark:text-zinc-400">{s.store_count} stores</td>
                      <td className="py-2.5 font-bold text-zinc-950 dark:text-white">${s.mean_sales.toLocaleString()}</td>
                      <td className="py-2.5 text-zinc-600 dark:text-zinc-400">${s.median_sales.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className="font-bold text-zinc-950 dark:text-white">{s.revenue_share_pct}%</span>
                      </td>
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
      {/* 3. INTERACTIVE GROUP-BY EXPLORER WITH INTERACTIVE GRAPH & CSV EXPORT */}
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
                Interactive Visual Distribution: {groupByDimension.replace(/([A-Z])/g, ' $1').trim()}
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
