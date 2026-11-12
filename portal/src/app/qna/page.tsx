"use client";

import React, { useState, useMemo } from "react";
import resultsData from "@/data/results.json";
import {
  ChevronDown,
  ChevronUp,
  Search,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2
} from "lucide-react";

export default function OralDefensePage() {
  const { oral_defense_qna } = resultsData;

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("Q1");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(oral_defense_qna.map((q) => q.category));
    return ["ALL", ...Array.from(set)];
  }, [oral_defense_qna]);

  // Filtered questions
  const filteredQnA = useMemo(() => {
    return oral_defense_qna.filter((q) => {
      const matchCat = activeCategory === "ALL" || q.category === activeCategory;
      const matchSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [oral_defense_qna, activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div id="qna" className="space-y-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-white text-zinc-950 dark:text-zinc-950 border border-zinc-300 dark:border-white shadow-xs">
            Oral Defense & Examination Prep
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums font-medium">16 Rapid-Fire Academic Q&As</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
          Oral Defense & Technical Viva Master Guide
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Detailed rationale defending methodological decisions, leak-free temporal splitting, metric selection
          (WMAE vs MSE), cold-start handling, and ethical boundary limits against rigorous academic examination.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 0. INDIVIDUAL UNDERSTANDING & ORAL DEFENSE DECLARATION (ES 335) */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
              ES 335 Oral Defense Rubric Requirement (5 Pts)
            </h2>
          </div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
            Individual Contributions, Key Choices, & Viva Defense Readiness
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Student 1: Mehul Patil */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Student 1 • Lead ML Engineer
                </span>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">Mehul Patil</h4>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Roll No. 25110200</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                Pipeline Architect
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  1. Modules Owned & Primary Contributions:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Devised the chronological leakage firewall (<code className="font-mono text-[11px]">cutoff: 2012-02-03</code>), out-of-fold target encoding transformations (<code className="font-mono text-[11px]">sd_median</code>, <code className="font-mono text-[11px]">dw_median</code>), 8-rung benchmark ladder, and Optuna 12-trial Bayesian hyperparameter search optimizing the champion XGBoost regressor ($1,616.78 WMAE).
                </p>
              </div>

              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  2. Key Methodological Choice Defended:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Championed replacing raw high-cardinality categorical IDs with historical median priors fitted strictly on pre-2012 training partitions. This prevented memorization, compressed variance by &gt;80%, and preserved 4.08 µs/row inference latency.
                </p>
              </div>

              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  3. Critical Limitation & Engineering Mitigation:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Identified cold-start risk on novel store-department pairs in future test horizons. Engineered a 3-tier hierarchical fallback chain (<code className="font-mono text-[11px]">Store-Dept &rarr; Dept Median &rarr; Global Median</code>) guaranteeing zero unhandled NaNs across all 11 unobserved test pairs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5 text-[11px]">
                  Reasoning About a Small Perturbation (Viva Scenario):
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] italic">
                  <strong>Examiner:</strong> "What happens if holiday weighting in WMAE increases from 5x to 10x?"<br />
                  <strong>Mehul:</strong> "A 10x penalty shifts the gradient objective to overweight peak holiday weeks (Weeks 47 and 51) even more aggressively. In ablation tests, this lowers holiday WMAE by ~8%, but inflates non-holiday error by ~3.2% due to conservative inventory buffers. The 5x weight perfectly matches real-world retail stockout vs holding cost economics ($1,750 vs $350)."
                </p>
              </div>
            </div>
          </div>

          {/* Student 2: Akshit Kumar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-0.5">
                  Student 2 • Data Analyst
                </span>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">Akshit Kumar</h4>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Roll No. 25110022</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                Feature Diagnostics
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  1. Modules Owned & Primary Contributions:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Executed multi-file relational schema joins across 536k records, audited missingness structures (60.6% missing markdowns pre-Nov 2011), analyzed Dept 47 return dynamics (1,285 negative rows), and constructed the operational asymmetric supply-chain cost engine ($350 overstock holding vs $1,750 stockout loss).
                </p>
              </div>

              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  2. Key Methodological Choice Defended:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Defended retaining 1,285 negative sales rows rather than clipping to 0.0 or dropping them. Documented that customer returns represent genuine operational cash outflows concentrated in seasonal post-holiday returns that any viable commercial model must anticipate.
                </p>
              </div>

              <div>
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5">
                  3. Critical Limitation & Engineering Mitigation:
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Identified the observational data ceiling: sales reflect censored demand bounded by store inventory stockouts rather than true unconstrained consumer appetite. Formulated mitigating confidence intervals and risk tiers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <strong className="text-zinc-950 dark:text-white block font-semibold mb-0.5 text-[11px]">
                  Reasoning About a Small Perturbation (Viva Scenario):
                </strong>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] italic">
                  <strong>Examiner:</strong> "What happens if fuel prices surge by +50% due to a macroeconomic supply shock?"<br />
                  <strong>Akshit:</strong> "Fuel price alone has near-zero direct correlation ($r = -0.0001$) and low feature gain (&lt;0.8%). In isolation, a +50% shock impacts forecast weekly sales by less than 0.4%. However, if the shock cascades into CPI and unemployment, our store-level forward-filled macro signals dampen discretionary departments (Dept 72 Toys) by 6.2% while keeping staple groceries (Dept 92) flat."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1. COHORT COMPOSITION & DATE RANGES MATRIX */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Evaluation Universe Audit</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Cohort Boundaries & Partition Timelines</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs tabular-nums">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
              TRAIN PARTITION (72.6%)
            </span>
            <div className="text-zinc-950 dark:text-white font-bold text-sm">305,982 Records</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              2010-02-05 to 2012-01-27 (104 weeks). Contains 8 promotional holiday events. Target encodings fitted strictly here.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-zinc-950 dark:text-white uppercase tracking-widest block">
              VALIDATION HOLDOUT (27.4%)
            </span>
            <div className="text-zinc-950 dark:text-white font-bold text-sm">115,588 Records</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              2012-02-03 to 2012-10-26 (39 weeks). Contains 2 holiday events (Super Bowl & Labor Day). Zero lookahead leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              OFFICIAL TEST PARTITION
            </span>
            <div className="text-zinc-950 dark:text-white font-bold text-sm">115,064 Records</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              2012-11-02 to 2013-07-26 (39 weeks). Preserved completely unlabelled. Contains 3 holidays and 11 cold-start series.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. LIFECYCLE SCENARIOS & WHY-WE-DIDN'T-DROP-ROWS */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Methodological Integrity</h2>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Edge Case Handling & Row Retention Rationale</h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Scenario / Edge Case</th>
                <th className="py-2.5 px-3">Occurrence Count</th>
                <th className="py-2.5 px-3">Naive Trap</th>
                <th className="py-2.5 px-3">Our Production Handling & Defense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Negative Sales (Returns)
                </td>
                <td className="py-3 px-3 text-zinc-900 dark:text-zinc-100 font-bold">1,285 rows (0.305%)</td>
                <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                  Dropping negative rows or replacing with 0.0
                </td>
                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium">
                  Retained in full; negative transactions reflect true retail returns. Regularized trees (`min_child_weight=12`) prevent split distortion.
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Missing CPI & Unemployment
                </td>
                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-bold">38,162 rows (Test)</td>
                <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                  Dropping features or global mean imputation
                </td>
                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium">
                  Store-level forward-filling (`groupby('Store').ffill()`) guarantees continuous macroeconomic tracking without lookahead leakage.
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Unobserved Markdown History
                </td>
                <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">270,889 rows (Pre-2011)</td>
                <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                  Mean imputation (fabricating fake discounts)
                </td>
                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium">
                  Imputed with 0.0 discount dollar amount plus binary `Has_MarkDown` flag to isolate unobserved promotional periods.
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                  Cold-Start Series in Test
                </td>
                <td className="py-3 px-3 text-zinc-950 dark:text-white font-bold">11 Pairs (36 rows)</td>
                <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                  Producing NaN or 0 forecast
                </td>
                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium">
                  Hierarchical fallback chain: Store-Dept &rarr; Dept Median &rarr; Global Median ensures every cold-start row receives valid forecast.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. RAPID-FIRE EXPANDABLE Q&A CARDS (16 QUESTIONS) */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Examiner Viva Guide</h2>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">16 Rapid-Fire Oral Defense Questions</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    activeCategory === cat
                      ? "bg-slate-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-xs font-bold border border-slate-700/60 dark:border-zinc-700"
                      : "text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white"
              />
            </div>
          </div>
        </div>

        {/* Accordion Cards */}
        <div className="space-y-3">
          {filteredQnA.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`rounded-xl border transition overflow-hidden ${
                  isExpanded
                    ? "bg-white dark:bg-zinc-950 border-2 border-zinc-950 dark:border-white shadow-sm"
                    : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs"
                }`}
              >
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                      {q.id}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-0.5">
                        {q.category}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{q.question}</h4>
                    </div>
                  </div>
                  <div className="text-zinc-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 leading-relaxed space-y-2">
                    <p>{q.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
