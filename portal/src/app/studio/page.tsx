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
  Info,
  Database,
  ShieldCheck,
  AlertTriangle,
  Table2,
  ArrowRight,
  Search
} from "lucide-react";

export default function DataStudioPage() {
  const { data_studio, dataset_architecture, feature_domains, feature_catalogue } = resultsData;
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

  // State for Dataset Architecture & Schemas (Shifted from Research Portal)
  const [selectedFile, setSelectedFile] = useState<string>("train.csv");

  // State for Preprocessing Pipeline scrubber (Shifted from Research Portal)
  const [activeEtlStep, setActiveEtlStep] = useState<number>(0);

  // State for Feature Matrix & Signals (Shifted from Research Portal)
  const [selectedFeatureProfile, setSelectedFeatureProfile] = useState<string>("Size");
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>("ALL");
  const [featureSearch, setFeatureSearch] = useState<string>("");

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

  // Monochrome domain styling helper
  const getDomainShade = (domainId: string) => {
    switch (domainId) {
      case "A":
        return {
          bar: "border-slate-800 dark:border-zinc-300",
          badge: "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100",
          tag: "bg-slate-700 text-white dark:bg-zinc-700 dark:text-zinc-100"
        };
      case "B":
        return {
          bar: "border-zinc-700 dark:border-zinc-300",
          badge: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950",
          tag: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
        };
      case "C":
        return {
          bar: "border-zinc-500 dark:border-zinc-400",
          badge: "bg-zinc-600 text-white dark:bg-zinc-400 dark:text-zinc-950",
          tag: "bg-zinc-600 text-white dark:bg-zinc-400 dark:text-zinc-950"
        };
      case "D":
        return {
          bar: "border-zinc-400 dark:border-zinc-600",
          badge: "bg-zinc-400 text-zinc-950 dark:bg-zinc-600 dark:text-white",
          tag: "bg-zinc-400 text-zinc-950 dark:bg-zinc-600 dark:text-white"
        };
      case "E":
      default:
        return {
          bar: "border-zinc-300 dark:border-zinc-700",
          badge: "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200",
          tag: "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200"
        };
    }
  };

  // Selected file schema
  const activeSchema = useMemo(() => {
    return dataset_architecture.files.find((f) => f.filename === selectedFile);
  }, [dataset_architecture.files, selectedFile]);

  // Filtered feature catalogue
  const filteredFeatures = useMemo(() => {
    return feature_catalogue.filter((f) => {
      const matchDomain = activeDomainFilter === "ALL" || f.domain === activeDomainFilter;
      const matchSearch =
        f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.desc.toLowerCase().includes(featureSearch.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [feature_catalogue, activeDomainFilter, featureSearch]);

  // Detailed step-by-step pipeline impact data
  const etlStepsData = [
    {
      step: "01",
      name: "Relational Join",
      title: "Store & Feature Alignment",
      metrics: [
        { label: "Training Records Retained", value: "421,570 / 421,570", pct: 100, tag: "100% Intact" },
        { label: "Dropped Records Risk", value: "0 rows dropped", pct: 0, tag: "Zero Loss" },
        { label: "Primary Key Alignment", value: "Store + Date + IsHoliday", pct: 100, tag: "Exact Match" }
      ],
      points: [
        "Left outer join preserves all 421,570 ground-truth department sales observations without loss.",
        "Avoids silent row dropping that occurs when inner joins encounter unobserved store dates.",
        "Guarantees identical temporal index ordering with official Kaggle test evaluation records."
      ]
    },
    {
      step: "02",
      name: "Macro Imputation",
      title: "CPI & Unemployment Forward-Fill",
      metrics: [
        { label: "Raw Test Missingness", value: "68.5% Missing", pct: 68.5, tag: "Unobserved Test" },
        { label: "Imputed Missingness", value: "0.0% Missing", pct: 100, tag: "Clean Fill" },
        { label: "Macro Signal Retained", value: "+1.2% Tree Importance", pct: 25, tag: "Signal Retained" }
      ],
      points: [
        "Store-level forward-fill propagates latest economic climate without future data leakage.",
        "Training partition median acts as robust secondary fallback for missing store series.",
        "Preserves macroeconomic shifts while ensuring clean numerical input vectors for trees."
      ]
    },
    {
      step: "03",
      name: "Markdown Encoding",
      title: "Promotional Discount Imputation",
      metrics: [
        { label: "Raw Pre-2011 Nulls", value: "64.2% Missing", pct: 64.2, tag: "Unrecorded Period" },
        { label: "Clean Zero-Discount Fill", value: "0.00 USD Imputed", pct: 100, tag: "True Economic $0" },
        { label: "Engineered Signals", value: "Total_MarkDown & Has_MarkDown", pct: 90, tag: "Dual Feature" }
      ],
      points: [
        "Physical economic reality: unrecorded promotional markdowns represent a literal $0.00 customer discount.",
        "Mean imputation would falsely fabricate phantom discounts throughout the entirety of 2010.",
        "Engineered Total_MarkDown aggregate and Has_MarkDown indicator cleanly separate discount presence."
      ]
    },
    {
      step: "04",
      name: "Surge Flags",
      title: "ISO Calendar Surge Flags",
      metrics: [
        { label: "Thanksgiving W47 Lift", value: "+45.2% Sales Volume", pct: 90, tag: "Holiday Surge" },
        { label: "Pre-Christmas W51 Lift", value: "+81.4% Sales Volume", pct: 100, tag: "Annual Peak" },
        { label: "WMAE Error Reduction", value: "-$117.80 WMAE", pct: 85, tag: "Statistically Verified" }
      ],
      points: [
        "Deconstructs coarse binary IsHoliday into specific calendar indicators (Weeks 6, 36, 47, 51, 52).",
        "Captures the unflagged pre-Christmas shopping rush that standard Kaggle holiday tags completely omit.",
        "Eliminates severe holiday under-forecasting bias on high-volume department categories."
      ]
    },
    {
      step: "05",
      name: "Target Statistics",
      title: "Hierarchical Out-of-Fold Priors",
      metrics: [
        { label: "Predictive Gain Carrier", value: "60.2% Total Model Gain", pct: 100, tag: "Primary Signal" },
        { label: "Training Partition Scope", value: "104 Weeks Strictly", pct: 100, tag: "Zero Leakage" },
        { label: "Shrinkage Stability", value: "sd_median & dw_median", pct: 95, tag: "Hierarchical Prior" }
      ],
      points: [
        "Computes Department-Week (dw_median) and Store-Dept (sd_median) baselines strictly within train window.",
        "Replaces high-cardinality categorical IDs with smooth continuous empirical priors.",
        "Guarantees complete chronological barrier: 0 forward leakage into the 39-week validation holdout."
      ]
    }
  ];

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
          <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">Schema Architecture, Preprocessing ETL &amp; Feature Signals</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
          Data Architecture, Feature Engineering &amp; Diagnostics Studio
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Explore the complete Walmart forecasting data universe. Audit relational schemas, inspect step-by-step ETL transformations, analyze univariate feature signals and gain rankings, examine cohort partition overlap, and interactively track 39-week holdout trajectories.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1. DATASET TOPOLOGY & SCHEMA PANEL (SHIFTED FROM RESEARCH PORTAL) */}
      {/* ------------------------------------------------------------------ */}
      <section id="architecture" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Data Engineering Foundation</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Dataset Topology &amp; Schema Panel</h3>
        </div>

        {/* Unit of Observation Callout Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 flex-shrink-0 mt-0.5">
              <Database size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                Unit of Observation (What One Row Represents)
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                Each row represents the weekly aggregate point-of-sale sales (<code className="font-mono text-[11px] px-1 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded">Weekly_Sales</code>, in $ USD) for a specific department within a specific store over a contiguous 7-day ISO calendar week (uniquely keyed by <code className="font-mono text-[11px] px-1 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded">Store</code>, <code className="font-mono text-[11px] px-1 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded">Dept</code>, and <code className="font-mono text-[11px] px-1 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded">Date</code>).
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-2.5 py-1 rounded text-[11px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
            536,634 Total Rows
          </span>
        </div>

        {/* Interactive File Inventory and Click-to-Inspect Schema */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* File selector cards */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Dataset Partitions (Click to Inspect)
            </span>
            {dataset_architecture.files.map((file) => (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file.filename)}
                className={`w-full p-4 rounded-xl text-left border transition flex items-center justify-between ${
                  selectedFile === file.filename
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700/80 dark:border-zinc-700 shadow-sm"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Database size={15} className={selectedFile === file.filename ? "text-white dark:text-zinc-950" : "text-zinc-600 dark:text-zinc-400"} />
                    <span className="text-sm font-bold">
                      {file.filename}
                    </span>
                  </div>
                  <span className={`text-xs block mt-1 ${selectedFile === file.filename ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {file.role}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold block tabular-nums">
                    {file.rows.toLocaleString()} rows
                  </span>
                  <span className={`text-[11px] tabular-nums ${selectedFile === file.filename ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                    {file.size_mb} MB
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Schema details panel */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                  Schema &amp; Data Dictionary
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {activeSchema?.filename}
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                Primary Keys: {activeSchema?.keys.join(", ")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-3">Column Name</th>
                    <th className="py-2 px-3">Dtype</th>
                    <th className="py-2 px-3">Semantic Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {activeSchema?.schema.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{s.col}</td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{s.type}</td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{s.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. PREPROCESSING AUDIT & ETL PIPELINE (SHIFTED FROM RESEARCH PORTAL) */}
      {/* ------------------------------------------------------------------ */}
      <section id="preprocessing" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Data Hygiene &amp; ETL</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Preprocessing Pipeline &amp; Decision Audit</h3>
        </div>

        {/* 5-Step Interactive ETL Pipeline Scrubber & Impact Graph */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {etlStepsData.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveEtlStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  activeEtlStep === idx
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700 shadow-sm"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeEtlStep === idx ? "text-zinc-300 dark:text-zinc-400" : "text-zinc-500"}`}>
                    Step {s.step}
                  </span>
                  {activeEtlStep === idx && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <h4 className="text-xs font-bold mt-1 truncate">{s.name}</h4>
              </button>
            ))}
          </div>

          {/* Interactive Step Detail Card with Metric Graph and Bullet Points */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step {etlStepsData[activeEtlStep].step} Architecture
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {etlStepsData[activeEtlStep].title}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                Click any step above to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
              {/* Dynamic Metric Bars for Active Step */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Quantified Impact Indicators
                </span>
                {etlStepsData[activeEtlStep].metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{m.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{m.value}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                          {m.tag}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-slate-800 dark:bg-zinc-300 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, m.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Structured Key Points */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Engineering Rationale &amp; Safeguards
                </span>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {etlStepsData[activeEtlStep].points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-slate-800 dark:text-zinc-200 font-bold mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Justification Cards - Structured with Bullet Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">
              DECISION 1: JOIN INTEGRITY
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Why Left Join on Store + Date?</h4>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">100% Row Retention:</strong> Zero row loss occurred across all 421,570 training records.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Truncation Protection:</strong> Inner joins risked dropping unobserved store dates, causing evaluation drift.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Test Alignment:</strong> Maintains exact contiguous sequence matching Kaggle evaluation rows.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block mb-1">
              DECISION 2: ZERO-MARKDOWN IMPUTATION
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Why 0.0 Instead of Mean Imputation?</h4>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Physical Truth:</strong> Markdowns represent promotional discounts; missing logs reflect a real $0.00 discount.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Anti-Hallucination:</strong> Mean imputation would falsely inject artificial discounts into 100% of 2010.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-800 dark:text-zinc-200 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Dual Signals:</strong> Created <code className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">Total_MarkDown</code> and <code className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">Has_MarkDown</code> flags.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
              DECISION 3: PRESERVING NEGATIVE SALES
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Why Retain 1,285 Negative Rows?</h4>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Return Diagnostics:</strong> Negative values capture genuine customer merchandise returns (concentrated in Dept 47).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Strict Honesty:</strong> Deleting negative returns fabricates optimistic bias and fails on unseen holdout returns.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">Tree Robustness:</strong> Tree split algorithms handle negative real targets without numerical divergence.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. FEATURE TAXONOMY & SIGNAL EXPLORER (SHIFTED FROM RESEARCH PORTAL) */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="space-y-5">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Input Representations</h2>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Feature Taxonomy &amp; Separation Signals</h3>
        </div>

        {/* Domain Taxonomy Pills - Styled in Shades of Grey for visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {feature_domains.map((dom) => {
            const shade = getDomainShade(dom.id);
            return (
              <div
                key={dom.id}
                className={`p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm border-t-4 ${shade.bar}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Domain {dom.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${shade.badge}`}>
                    {dom.count} feats
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 mt-2">{dom.name}</h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1.5 leading-snug">{dom.description}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Signals Interactive Profile Explorer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Univariate Signal Explorer
              </span>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                Feature Band vs. Mean Target Sales
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Select Feature:</span>
              <select
                value={selectedFeatureProfile}
                onChange={(e) => setSelectedFeatureProfile(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100 shadow-xs"
              >
                <option value="Size">Store Floor Size (sq. ft.)</option>
                <option value="Type">Store Format Type (A, B, C)</option>
                <option value="IsHoliday">IsHoliday Indicator (0 vs 1)</option>
                <option value="Week">ISO Calendar Week of Year</option>
              </select>
            </div>
          </div>

          {/* Interactive Profile Visualization in Shades of Grey */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            <div className="lg:col-span-3 space-y-3">
              {selectedFeatureProfile === "Size" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-zinc-700 dark:text-zinc-300">Small Stores (&lt;70k sq. ft.)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">$9,519 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-400 dark:bg-zinc-600 h-3 rounded-full" style={{ width: "35%" }} />
                  </div>

                  <div className="flex justify-between text-xs tabular-nums pt-2">
                    <span className="text-zinc-700 dark:text-zinc-300">Medium Stores (70k–140k sq. ft.)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">$12,237 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-600 dark:bg-zinc-400 h-3 rounded-full" style={{ width: "55%" }} />
                  </div>

                  <div className="flex justify-between text-xs tabular-nums pt-2">
                    <span className="text-zinc-950 dark:text-white font-semibold">Supercenters (&gt;140k sq. ft.)</span>
                    <span className="font-bold text-zinc-950 dark:text-white">$20,099 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-950 dark:bg-white h-3 rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>
              )}

              {selectedFeatureProfile === "Type" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-zinc-950 dark:text-white font-semibold">Type A (22 stores, 64.3% revenue)</span>
                    <span className="font-bold text-zinc-950 dark:text-white">$20,099 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-950 dark:bg-white h-3 rounded-full" style={{ width: "88%" }} />
                  </div>

                  <div className="flex justify-between text-xs tabular-nums pt-2">
                    <span className="text-zinc-700 dark:text-zinc-300">Type B (17 stores, 29.7% revenue)</span>
                    <span className="font-bold text-zinc-950 dark:text-zinc-100">$12,237 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-600 dark:bg-zinc-400 h-3 rounded-full" style={{ width: "52%" }} />
                  </div>

                  <div className="flex justify-between text-xs tabular-nums pt-2">
                    <span className="text-zinc-700 dark:text-zinc-300">Type C (6 small format stores, 6.0% revenue)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">$9,519 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-400 dark:bg-zinc-600 h-3 rounded-full" style={{ width: "38%" }} />
                  </div>
                </div>
              )}

              {selectedFeatureProfile === "IsHoliday" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-zinc-700 dark:text-zinc-300">Regular Non-Holiday Weeks (92.96% of data)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">$15,901 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-400 dark:bg-zinc-600 h-3 rounded-full" style={{ width: "65%" }} />
                  </div>

                  <div className="flex justify-between text-xs tabular-nums pt-2">
                    <span className="text-zinc-950 dark:text-white font-semibold">Holiday Weeks (7.04% of data, 5x penalty weight)</span>
                    <span className="font-bold text-zinc-950 dark:text-white">$17,035 mean</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3">
                    <div className="bg-zinc-950 dark:bg-white h-3 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              )}

              {selectedFeatureProfile === "Week" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-zinc-700 dark:text-zinc-300">Average Regular Week</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">$15,400</span>
                  </div>
                  <div className="flex justify-between text-xs tabular-nums pt-1">
                    <span className="text-zinc-800 dark:text-zinc-200">Week 47 (Thanksgiving Surge)</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">$22,400 (+45%)</span>
                  </div>
                  <div className="flex justify-between text-xs tabular-nums pt-1">
                    <span className="text-zinc-950 dark:text-white font-bold">Week 51 (Pre-Christmas Highest Annual Peak)</span>
                    <span className="font-bold text-red-600 dark:text-red-400 tabular-nums">$27,800 (+81%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cliff cards */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
              <span className="text-[10px] font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider block">
                Signal Cliff Callout
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                Notice the steep non-linear cliff at <strong className="text-zinc-950 dark:text-white">140,000 sq. ft.</strong>: stores above this threshold
                drive double the departmental throughput due to Supercenter grocery footfall.
              </p>
            </div>
          </div>
        </div>

        {/* Full Sortable Feature Catalogue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                Feature Catalogue
              </span>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                Top Features Sorted by Relative Gain
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Domain filter pills */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
                {["ALL", "A", "B", "C", "D", "E"].map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setActiveDomainFilter(dom)}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      activeDomainFilter === dom
                        ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-xs font-bold border border-slate-700/60 dark:border-zinc-700"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    {dom === "ALL" ? "All Domains" : `Dom ${dom}`}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search feature..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Missing %</th>
                  <th className="py-2.5 px-3">Unique</th>
                  <th className="py-2.5 px-3">Median</th>
                  <th className="py-2.5 px-3">Gain %</th>
                  <th className="py-2.5 px-3">Corr (r)</th>
                  <th className="py-2.5 px-3 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredFeatures.map((f, idx) => {
                  const shade = getDomainShade(f.domain);
                  return (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{f.name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shade.tag}`}>
                          Domain {f.domain}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400">{f.missing_pct}%</td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">{f.unique.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold">{f.median.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-zinc-950 dark:text-white font-bold">
                        {(f.importance_gain * 100).toFixed(1)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold tabular-nums ${
                          f.univariate_corr > 0.3
                            ? "text-emerald-600 dark:text-emerald-400"
                            : f.univariate_corr < -0.05
                            ? "text-red-600 dark:text-red-400"
                            : "text-zinc-600 dark:text-zinc-400 font-medium"
                        }`}
                      >
                        {f.univariate_corr > 0 ? `+${f.univariate_corr.toFixed(3)}` : f.univariate_corr.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 max-w-xs truncate">{f.desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. COHORT OVERLAP & INTERSECTION MATRIX (WITH JACCARD) */}
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
      {/* 5. INTERACTIVE STORE & DEPT HOLDOUT TRAJECTORY INSPECTOR (PROPOSAL Q7) */}
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

        {/* Series Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          {/* Store Selector */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Select Physical Store ({holdoutData.stores.length} Formats Available)
            </label>
            <select
              value={selectedStore}
              onChange={(e) => {
                const newStoreId = Number(e.target.value);
                setSelectedStore(newStoreId);
                if (!holdoutData.series[`${newStoreId}_${selectedDept}`]) {
                  const firstActive = holdoutData.departments.find(
                    (d) => holdoutData.series[`${newStoreId}_${d.id}`]
                  );
                  if (firstActive) {
                    setSelectedDept(firstActive.id);
                  }
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-semibold text-zinc-950 dark:text-white shadow-2xs"
            >
              {holdoutData.stores.map((s) => (
                <option key={s.id} value={s.id}>
                  Store #{s.id} — {s.type} ({s.size.toLocaleString()} sq ft)
                </option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Select Department Unit ({holdoutData.departments.length} Archetypes Available)
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-semibold text-zinc-950 dark:text-white shadow-2xs"
            >
              {holdoutData.departments.map((d) => {
                const isAvailable = Boolean(holdoutData.series[`${selectedStore}_${d.id}`]);
                return (
                  <option key={d.id} value={d.id}>
                    Dept #{d.id} — {d.name}{!isAvailable ? " (Inactive in this Store)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Benchmark Preset Series Buttons */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Curated Diagnostic Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(10);
                  setSelectedDept(72);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                  selectedStore === 10 && selectedDept === 72
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                Store 10 / Dept 72 (Toys)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(1);
                  setSelectedDept(92);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                  selectedStore === 1 && selectedDept === 92
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                Store 1 / Dept 92 (Grocery)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(20);
                  setSelectedDept(95);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                  selectedStore === 20 && selectedDept === 95
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                Store 20 / Dept 95 (General)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(14);
                  setSelectedDept(38);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                  selectedStore === 14 && selectedDept === 38
                    ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 border-slate-700"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                Store 14 / Dept 38 (Pharmacy)
              </button>
            </div>
          </div>
        </div>

        {/* Selected Series KPI Scoreboard */}
        {!currentSeries ? (
          <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">No active holdout records for Store #{selectedStore} — Dept #{selectedDept}</p>
            <p className="text-[11px]">This department was not active in this physical format during the 39-week holdout evaluation window. Please choose another department from the selector or pick one of the curated presets above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Series Info</span>
              <span className="text-sm font-bold text-zinc-950 dark:text-white block mt-0.5">
                Store {currentSeries.store} • Dept {currentSeries.dept}
              </span>
              <span className="text-[10px] text-zinc-500 truncate block">
                {currentSeries.store_info.type} • {currentSeries.dept_info.name}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Champion XGBoost WMAE
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5 tabular-nums">
                ${currentSeries.metrics.xgb_wmae.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-400">Evaluation metric</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Random Forest WMAE</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5 tabular-nums">
                ${currentSeries.metrics.rf_wmae.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-400">100-Tree ensemble</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Ridge Linear WMAE</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5 tabular-nums">
                ${currentSeries.metrics.ridge_wmae.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-400">Linear baseline</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Historical Median</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5 tabular-nums">
                ${currentSeries.metrics.median_wmae.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-400">Zero-ML benchmark</span>
            </div>
          </div>
        )}

        {/* Model Visibility Toggles & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Toggle Model Curves:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-950 dark:text-white">
              <input
                type="checkbox"
                checked={visibleModels.actual}
                onChange={(e) => setVisibleModels({ ...visibleModels, actual: e.target.checked })}
                className="accent-zinc-950 dark:accent-white"
              />
              <span className="inline-block w-3 h-0.5 bg-zinc-950 dark:bg-white" />
              <span>Ground Truth Actual</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">
              <input
                type="checkbox"
                checked={visibleModels.xgb}
                onChange={(e) => setVisibleModels({ ...visibleModels, xgb: e.target.checked })}
                className="accent-emerald-600"
              />
              <span className="inline-block w-3 h-0.5 bg-emerald-600" />
              <span>Champion XGBoost</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={visibleModels.rf}
                onChange={(e) => setVisibleModels({ ...visibleModels, rf: e.target.checked })}
                className="accent-slate-700"
              />
              <span className="inline-block w-3 h-0.5 bg-slate-600" />
              <span>Random Forest</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-amber-700 dark:text-amber-400">
              <input
                type="checkbox"
                checked={visibleModels.ridge}
                onChange={(e) => setVisibleModels({ ...visibleModels, ridge: e.target.checked })}
                className="accent-amber-600"
              />
              <span className="inline-block w-3 h-0.5 bg-amber-600" />
              <span>Ridge Regression</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-zinc-500">
              <input
                type="checkbox"
                checked={visibleModels.median}
                onChange={(e) => setVisibleModels({ ...visibleModels, median: e.target.checked })}
                className="accent-zinc-400"
              />
              <span className="inline-block w-3 h-0.5 bg-zinc-400 border-dashed" />
              <span>Historical Median</span>
            </label>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Weekly Sequence (2012-02-03 through 2012-10-26 — 39 Contiguous Weeks)</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Hover over points for exact dollar values
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[700px] select-none"
              style={{ maxHeight: "380px" }}
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const val = chartBounds.min + pct * (chartBounds.max - chartBounds.min);
                const y = getYCoord(val);
                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800/80"
                      strokeDasharray={pct === 0 || pct === 1 ? undefined : "3 3"}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-zinc-400 dark:fill-zinc-500 tabular-nums font-mono"
                    >
                      ${(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Empty state overlay inside SVG if no displayed points */}
              {displayedPoints.length === 0 && (
                <text
                  x={chartWidth / 2}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  className="text-xs fill-zinc-400 dark:fill-zinc-500 font-medium"
                >
                  No holdout trajectory points available for this selection.
                </text>
              )}

              {/* Holiday shaded vertical regions */}
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
                      fill="currentColor"
                      className="text-amber-500/10 dark:text-amber-400/15"
                    />
                    <text
                      x={x}
                      y={padTop + 12}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-amber-700 dark:fill-amber-400 uppercase tracking-tighter"
                    >
                      5× Hol
                    </text>
                  </g>
                );
              })}

              {/* Polylines for each visible model */}
              {visibleModels.median && (
                <polyline
                  points={makePolyline("pred_median")}
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-600"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {visibleModels.ridge && (
                <polyline
                  points={makePolyline("pred_ridge")}
                  fill="none"
                  stroke="currentColor"
                  className="text-amber-600 dark:text-amber-500"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {visibleModels.rf && (
                <polyline
                  points={makePolyline("pred_rf")}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-600 dark:text-slate-400"
                  strokeWidth="2"
                />
              )}

              {visibleModels.xgb && (
                <polyline
                  points={makePolyline("pred_xgb")}
                  fill="none"
                  stroke="currentColor"
                  className="text-emerald-600 dark:text-emerald-400"
                  strokeWidth="2.5"
                />
              )}

              {visibleModels.actual && (
                <polyline
                  points={makePolyline("actual")}
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-950 dark:text-white"
                  strokeWidth="2.5"
                />
              )}

              {/* Data points & Interactive Hover targets */}
              {displayedPoints.map((p, idx) => {
                const x = getXCoord(idx);
                const yAct = getYCoord(p.actual);
                const yXgb = getYCoord(p.pred_xgb);
                const isHovered = hoveredWeekIndex === idx;

                return (
                  <g key={`pt-${idx}`}>
                    {/* Hover vertical tracking line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={chartHeight - padBottom}
                        stroke="currentColor"
                        className="text-zinc-400 dark:text-zinc-500"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Actual circle point */}
                    {visibleModels.actual && (
                      <circle
                        cx={x}
                        cy={yAct}
                        r={isHovered ? 4.5 : p.is_holiday ? 3.5 : 2.5}
                        fill="currentColor"
                        className={p.is_holiday ? "text-amber-500" : "text-zinc-950 dark:text-white"}
                      />
                    )}

                    {/* XGB circle point */}
                    {visibleModels.xgb && (
                      <circle
                        cx={x}
                        cy={yXgb}
                        r={isHovered ? 4 : 2}
                        fill="currentColor"
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    )}

                    {/* Invisible expanded hit target for smooth hovering */}
                    <rect
                      x={x - 10}
                      y={padTop}
                      width={20}
                      height={chartHeight - padTop - padBottom}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWeekIndex(idx)}
                      onMouseLeave={() => setHoveredWeekIndex(null)}
                    />
                  </g>
                );
              })}

              {/* X-Axis Dates / Week labels */}
              {displayedPoints.map((p, idx) => {
                if (idx % 4 !== 0 && idx !== displayedPoints.length - 1) return null;
                const x = getXCoord(idx);
                return (
                  <text
                    key={`xlabel-${idx}`}
                    x={x}
                    y={chartHeight - padBottom + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-zinc-400 dark:fill-zinc-500 tabular-nums"
                  >
                    W{p.week}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card for hovered week */}
          {hoveredWeekIndex !== null && displayedPoints[hoveredWeekIndex] && (
            <div className="p-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs shadow-md flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold">
                  Week {displayedPoints[hoveredWeekIndex].week} • {displayedPoints[hoveredWeekIndex].date}
                </span>
                {displayedPoints[hoveredWeekIndex].is_holiday === 1 && (
                  <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-zinc-950">
                    5× Holiday Weight
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 tabular-nums">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-600 text-[11px] block">Actual:</span>
                  <span className="font-bold">${displayedPoints[hoveredWeekIndex].actual.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-emerald-400 dark:text-emerald-600 text-[11px] block">XGBoost:</span>
                  <span className="font-bold text-emerald-400 dark:text-emerald-600">
                    ${displayedPoints[hoveredWeekIndex].pred_xgb.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-600 text-[11px] block">XGB Error:</span>
                  <span className="font-bold">
                    ${Math.abs(displayedPoints[hoveredWeekIndex].actual - displayedPoints[hoveredWeekIndex].pred_xgb).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-600 text-[11px] block">Random Forest:</span>
                  <span>${displayedPoints[hoveredWeekIndex].pred_rf.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-600 text-[11px] block">Ridge:</span>
                  <span>${displayedPoints[hoveredWeekIndex].pred_ridge.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. STRUCTURAL DEEP DIVES: FORMAT DYNAMICS & ANCHORS */}
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
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">
                        ${s.mean_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-zinc-700 dark:text-zinc-300">
                        ${s.median_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. INTERACTIVE MULTI-DIMENSIONAL GROUP-BY EXPLORER */}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-2xs active:scale-95"
              title="Download sliced slice as CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Visual Bar Summary of Grouped Dimension */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Distribution Across {groupByDimension}
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Relative comparison of Average Weekly Sales (dark bar) vs. Median Weekly Sales (subtle bar).
              </p>
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
              {dimensionData.length} active cohorts
            </span>
          </div>

          <div className="space-y-3">
            {(() => {
              const maxAvg = Math.max(...dimensionData.map((d) => d.avgSales), 1);
              return dimensionData.map((d, idx) => {
                const avgPct = Math.max(5, Math.min(100, (d.avgSales / maxAvg) * 100));
                const medPct = Math.max(5, Math.min(100, (d.medianSales / maxAvg) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{d.key}</span>
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
