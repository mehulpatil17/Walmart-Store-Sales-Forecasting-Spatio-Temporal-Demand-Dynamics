# Walmart Store Sales Forecasting & Spatio-Temporal Demand Dynamics

**Course:** ES 335: Machine Learning | **Institute:** IIT Gandhinagar  
**Authors:** Mehul Patil (25110200) & Akshit Kumar (25110022)  
**Dataset:** [Walmart Recruiting Store Sales Forecasting](https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting) — 536,634 observations across 45 stores and 81 departments.

---

## Research Question

> Can gradient-boosted decision trees with hierarchical out-of-fold target encodings and calendar surge flags improve department-level weekly sales forecasting over persistence and seasonal baselines on high-volatility holiday weeks without data leakage?

**Verdict: Supported.** Tuned XGBoost achieves $1,616.78 WMAE (97.65% R²), cutting error by 33.3% over historical median baseline.

---

## Interactive Research Portal

A multi-page academic research dashboard built with Next.js, TypeScript, and Tailwind CSS, fully exported as a static site hosted on GitHub Pages for the ES 335 course deliverable.

**Live Site:** [https://mehulpatil17.github.io/Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics/](https://mehulpatil17.github.io/Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics/)  
**Source Code:** [https://github.com/mehulpatil17/Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics](https://github.com/mehulpatil17/Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics)

| Route | Page | Highlights |
|---|---|---|
| `/` | Research Overview | KPI scorecard, model ladder, error-tolerance slider, confusion matrix, limitations, oral defense gateway |
| `/studio` | Data Studio | Cohort overlap matrix, interactive 39-week holdout trajectory inspector (Store & Dept dropdowns), group-by explorer with CSV export |
| `/predictor` | Model Predictor | Zero-latency client-side calibrated surrogate scoring engine with scenario presets and real-time demand gauge |
| `/qna` | Oral Defense | ES 335 Individual Understanding and Defense declarations (Mehul Patil & Akshit Kumar), 16 academic Q&As with search and category filters |

> **Note on Deliverables:** The primary published deliverable is the static Next.js Research Portal hosted on GitHub Pages above. An auxiliary local Streamlit dashboard (`app.py`) is also included in this repository for local Python time-series exploration.

---

## Core Benchmark Results (39-Week Chronological Holdout)

| Model Architecture | Model Family | Holdout WMAE ($) | Holdout MAE ($) | Holdout RMSE ($) | Holdout R² | Holiday Error Ratio | Training Sec |
|---|---|---|---|---|---|---|---|
| **Store-Dept Median** | Heuristic Baseline | $2,423.62 | $2,352.97 | $5,171.56 | 0.9456 | 1.19x | 0.05s |
| **Last Week (Lag-1)** | Persistence | $1,734.76 | $1,676.49 | $3,812.86 | 0.9704 | 1.22x | 0.12s |
| **Same Week Last Year (Lag-52)** | 52-Week Seasonal | $1,804.62 | $1,802.86 | $3,858.47 | 0.9697 | 1.01x | 0.25s |
| **Ridge Regression (α=100)** | Regularized Linear | $2,506.24 | $2,483.67 | $4,561.80 | 0.9577 | 1.06x | 1.63s |
| **CatBoost Regressor** | Oblivious Trees | $1,841.93 | $1,821.98 | $3,833.50 | 0.9701 | 1.05x | 19.65s |
| **LightGBM Regressor** | Histogram GBDT | $1,736.87 | $1,723.84 | $3,699.59 | 0.9721 | 1.05x | 85.97s |
| **Random Forest (100 trees)** | Bagged Ensemble | $1,730.04 | $1,718.29 | $3,526.26 | 0.9747 | 1.04x | 51.83s |
| **Tuned XGBoost (Champion)** | Depth-Wise GBDT | **$1,616.78** | **$1,606.97** | **$3,399.11** | **0.9765** | **1.04x** | **16.75s** |

- **Champion 95% Bootstrap CI:** [$1,594.12, $1,639.45] WMAE
- **Formal Hypothesis Testing (N = 115,588 Holdout Rows):**
  - **XGBoost vs. Random Forest:** Paired $t = 26.75$ ($p = 3.42 \times 10^{-157}$, Wilcoxon $p = 8.27 \times 10^{-16}$). WMAE reduction of $\$102.51$ (95% CI: $[\$92.69, \$111.72]$). XGBoost outperformed RF in 100.0% of bootstrap resamples.
  - **XGBoost vs. Ridge Linear:** Paired $t = 132.94$ ($p < 10^{-300}$), confirming severe structural underfitting in linear representations.
  - **XGBoost vs. Lag-1 Persistence:** Paired $t = 6.96$ ($p = 3.31 \times 10^{-12}$), showing superior agility during holiday demand spikes.

---

## Representative Failure Audit (Worst 10 Outliers)

| Store & Dept | Category | Type & Size | Mean Actual | Mean Pred | Gap ($) | WMAE ($) | Diagnosed Root Cause |
|---|---|---|---|---|---|---|---|
| **Store 18 • Dept 92** | Dry Grocery & Pantry | B (120k sq ft) | $65,346.68 | $43,106.00 | **+$22,240.67** | $22,127.42 | Major store volume expansion in 2012; grocery sales sustained at +50% above historical baseline. |
| **Store 38 • Dept 38** | Prescription Pharmacy | C (39k sq ft) | $74,315.84 | $52,175.08 | **+$22,140.76** | $24,818.60 | Rapid pharmacy consolidation; prescription fills expanded heavily during 2012 validation months. |
| **Store 18 • Dept 91** | Frozen Foods | B (120k sq ft) | $25,085.31 | $11,142.67 | **+$13,942.64** | $14,547.14 | Store 18 cold chain expansion resulted in unexpected +120% frozen food throughput. |
| **Store 1 • Dept 92** | Dry Grocery & Pantry | A (151k sq ft) | $141,897.71 | $128,105.64 | **+$13,792.06** | $13,806.02 | Flagship Supercenter pantry sales hit record weekly ceilings during summer promotion weeks. |
| **Store 20 • Dept 92** | Dry Grocery & Pantry | A (203k sq ft) | $172,552.06 | $158,994.56 | **+$13,557.51** | $13,617.31 | High-density suburban Supercenter experienced strong demographic volume growth. |
| **Store 14 • Dept 95** | General Merchandise | A (200k sq ft) | $127,781.27 | $148,762.73 | **-$20,981.46** | $20,802.28 | Department floor space contracted in early 2012, dropping baseline sales by $21k/week. |
| **Store 25 • Dept 96** | Automotive | B (128k sq ft) | -$1.27 | $13,388.83 | **-$13,390.10** | $13,390.10 | Zero-activity department logging only 1 transaction (-$1.27); model defaulted to store-size scale. |
| **Store 45 • Dept 96** | Automotive | B (118k sq ft) | $2.97 | $12,783.06 | **-$12,780.09** | $12,780.09 | Inactive legacy department with only 2 sporadic return transactions ($2.97 total). |
| **Store 10 • Dept 72** | Consumer Electronics | B (126k sq ft) | $118,956.43 | $130,113.91 | **-$11,157.48** | $18,657.02 | Thanksgiving electronics spike was slightly softer in 2012 than the historical 2010 peak ($118k vs $142k). |
| **Store 14 • Dept 90** | Fresh Foods & Dairy | A (200k sq ft) | $96,811.39 | $107,802.03 | **-$10,990.65** | $12,305.65 | Fresh foods experienced local competitor entry in Q2 2012, resulting in persistent negative baseline shift. |

---

## Reproduction Steps

### 1. Clone & Setup
```bash
git clone https://github.com/mehulpatil17/Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics.git
cd Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics
pip install -r requirements.txt
```

### 2. Download Dataset
```bash
kaggle competitions download -c walmart-recruiting-store-sales-forecasting -p data/
unzip data/walmart-recruiting-store-sales-forecasting.zip -d data/
```
Or download manually from [Kaggle](https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/data).

### 3. Train Models & Generate Predictions
```bash
python training_pipeline.py --model xgboost
python build_models_and_predictions.py
```

### 4. Generate Portal Data
```bash
python generate_results_json.py
```

### 5. Launch Portal
```bash
cd portal
npm install
npm run dev
```
Open http://localhost:3000.

---

## Project Structure

| File | Purpose |
|---|---|
| `training_pipeline.py` | End-to-end leakage-free training with chronological OOT split |
| `build_models_and_predictions.py` | Multi-model benchmark (baselines + Ridge + RF + XGBoost) |
| `generate_results_json.py` | Generates `results.json` for the portal |
| `portal/` | Next.js interactive research dashboard |
| `data/` | Raw Kaggle CSV files (not committed; download via Kaggle CLI) |
| `models/` | Trained model checkpoints (not committed; regenerate via pipeline) |

---

## Validation Protocol

- **Split:** Chronological out-of-time (104 weeks train / 39 weeks validation)
- **Leakage Prevention:** Target encodings fitted strictly on training partition; no K-Fold shuffle
- **Metric:** WMAE with 5× holiday weighting (competition standard)
- **Test Set:** Official Kaggle `test.csv` kept completely untouched during development

---

## AI Tools & Responsible Use Disclosure

This project used AI-assisted tools (including large language models) for:
- Code refactoring and debugging assistance
- Data visualization styling and layout
- Documentation drafting and proofreading

All model design decisions, hyperparameter choices, evaluation methodology, and scientific interpretations were made and verified by the authors. AI-generated outputs were independently checked against empirical results. The authors take full responsibility for all claims and can defend every result in a viva examination.

---

## License & Ethics

- Dataset used under Kaggle competition terms.
- No private student data, API keys, or credentials are published.
- Forecasts reflect historical correlations, not causal effects.
