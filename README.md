# Walmart Weekly Sales Forecasting by Store and Department

**Course:** ES 335: Machine Learning | **Institute:** IIT Gandhinagar  
**Authors:** Mehul Patil (25110200) & Akshit Kumar (25110022)  
**Dataset:** [Walmart Recruiting Store Sales Forecasting](https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting) — 536,634 observations across 45 stores and 81 departments.

---

## Research Question

> Can gradient-boosted decision trees with historical group medians and calendar surge flags improve department-level weekly sales forecasting over linear and heuristic baselines on high-volatility holiday weeks without data leakage?

**Verdict: Supported.** Tuned XGBoost achieves $1,616.78 WMAE (97.65% R²), cutting error by 33.3% over the historical median baseline and 6.5% over Random Forest.

---

## Interactive Research Portal

A multi-page academic research dashboard built with Next.js, TypeScript, and Tailwind CSS, fully exported as a static site hosted on GitHub Pages for the ES 335 course deliverable.

**Live Site:** [https://mehulpatil17.github.io/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department/](https://mehulpatil17.github.io/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department/)  
**Source Code:** [https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department](https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department)

| Route | Page | Highlights |
|---|---|---|
| `/` | Research Portal | Overview & verdict, formal research question, foundational discoveries, KPI scorecard, leak-free validation firewall, 8-rung model ladder, decision support, and error/risk governance |
| `/studio` | Data Studio | Dataset architecture & schema viewer, 5-step ETL pipeline scrubber, 19-feature taxonomy & signal explorer, cohort overlap matrix, interactive 39-week holdout trajectory inspector, and group-by explorer with CSV export |
| `/predictor` | Model Predictor | Zero-latency client-side calibrated surrogate scoring engine with scenario presets and real-time demand gauge |
| `/qna` | Oral Defense | ES 335 Individual Understanding and Defense declarations (Mehul Patil & Akshit Kumar), 16 academic Q&As with search and category filters |

> **Note on Deliverables:** The primary published deliverable is the Next.js Research Portal hosted on GitHub Pages above.

---

## Core Benchmark Results (39-Week Chronological Holdout)

| Model Architecture | Model Family | Holdout WMAE ($) | Holdout MAE ($) | Holdout RMSE ($) | Holdout R² | Holiday Error Ratio | Training Sec |
|---|---|---|---|---|---|---|---|
| **Store-Dept Median** | Heuristic Baseline | $2,423.62 | $2,352.97 | $5,171.56 | 0.9456 | 1.19x | 0.05s |
| **Ridge Regression (α=100)** | Regularized Linear ($L_2$) | $2,506.24 | $2,483.67 | $4,561.80 | 0.9577 | 1.06x | 1.63s |
| **Random Forest (100 trees)** | Bagged Ensemble | $1,730.04 | $1,718.29 | $3,526.26 | 0.9747 | 1.04x | 51.83s |
| **Tuned XGBoost (Champion)** | Depth-Wise GBDT | **$1,616.78** | **$1,606.97** | **$3,399.11** | **0.9765** | **1.04x** | **16.75s** |

- **Error Reduction:** Tuned XGBoost reduces WMAE by **$806.84 (-33.3%)** over the heuristic median baseline and by **$113.26 (-6.5%)** over Random Forest.
- **Model Progression:**
  - **Store-Dept Median:** Non-parametric empirical floor baseline.
  - **Ridge Regression:** Demonstrates high structural bias ($2,506.24 WMAE) from linear inability to capture holiday multiplicative interactions.
  - **Random Forest:** Bagged variance reduction ($1,730.04 WMAE) using parallel decorrelated trees.
  - **Tuned XGBoost:** Dominant sequential boosting with Hessian-guided pruning and leaf regularization.

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

---

## Reproduction & Execution Protocol Across Operating Systems

This project is engineered for deterministic reproducibility (`SEED = 42`) across **Windows**, **Linux**, and **macOS**.

### System & Toolchain Prerequisites

| Component | Minimum Requirement | Recommended / Verified | Notes |
|---|---|---|---|
| **Python** | 3.10+ | 3.10 – 3.14 (x64 / arm64) | Requires `pip` and virtual environment support (`venv`) |
| **Node.js** | 18+ LTS | v20 LTS / v22 | Required for the interactive Next.js research portal (`portal/`) |
| **RAM** | 8 GB | 16 GB | Needed for XGBoost & Random Forest multi-threaded training |
| **Disk Space** | ~250 MB | 500 MB | Raw CSVs (15 MB), Parquet holdout partitions (7.5 MB), Model weights (136 MB) |
| **C/C++ & OpenMP** | System default | `libomp` (macOS), `libgomp1` (Linux) | **Crucial for macOS:** XGBoost multi-threading requires OpenMP |

---

### Dataset Acquisition & Alternate Download Options

The dataset comprises 421,570 training rows across 45 stores and 81 departments. You can obtain it via any of the following three methods:

#### Option 1: Automated Python Helper (Recommended — Zero Configuration)
A single self-contained script handles downloading, recursive unzipping of nested archives (e.g. `train.csv.zip`, `features.csv.zip`), path normalization, and row-count verification:
```bash
# Run automated download & extraction
python download_dataset.py

# Verify dataset checksums and dimensions
python download_dataset.py --check
```

#### Option 2: Official Kaggle CLI
If you already have your Kaggle credentials configured:
1. Ensure your `kaggle.json` token is placed in:
   - **Windows:** `%USERPROFILE%\.kaggle\kaggle.json`
   - **Linux / macOS:** `~/.kaggle/kaggle.json` (set permissions: `chmod 600 ~/.kaggle/kaggle.json`)
2. Accept the competition rules at [Kaggle Competition Rules](https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/rules).
3. Download and extract:
```bash
kaggle competitions download -c walmart-recruiting-store-sales-forecasting -p data/
python download_dataset.py --extract-only
```

#### Option 3: Direct Web Browser Download (100% Credential-Free — No Token Needed)
If you do not have a Kaggle API token or prefer a direct web browser download:
1. Visit the Kaggle data page: [Walmart Recruiting Store Sales Forecasting Data](https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/data).
2. Log in and accept the competition rules if prompted.
3. Click the **"Download All"** button to download `walmart-recruiting-store-sales-forecasting.zip` (~15 MB).
4. Place the downloaded `.zip` file inside the `data/` directory.
5. Run the automated extractor and validator:
```bash
python download_dataset.py --extract-only
python download_dataset.py --check
```
*Note:* If unzipping manually, make sure to extract the inner archives (`train.csv.zip`, `features.csv.zip`, and `test.csv.zip`) into `data/` so that `stores.csv`, `train.csv`, `features.csv`, and `test.csv` are present.

---

### Step-by-Step Execution Protocols by Operating System

````carousel
```powershell
# ====================================================================
# WINDOWS (PowerShell 5.1 / PowerShell 7+ / CMD)
# ====================================================================

# 1. Clone & create virtual environment
git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git
cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department
python -m venv venv
.\venv\Scripts\Activate.ps1
# (If blocked by execution policy, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# 2. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Ingest and verify dataset
python download_dataset.py
python download_dataset.py --check

# 4. Execute deterministic ML pipelines
python training_pipeline.py
python build_models_and_predictions.py
python generate_results_json.py

# 5. Launch Model Server & Interactive Web Portal
.\run_portal.bat
# (Concurrently starts Python model_server.py on :5001 and Next.js portal on :3000)
```
<!-- slide -->
```bash
# ====================================================================
# LINUX (Ubuntu / Debian / RHEL / Fedora)
# ====================================================================

# 1. Install system prerequisites (Ubuntu/Debian)
sudo apt update && sudo apt install -y python3-venv python3-pip build-essential libgomp1 unzip nodejs npm

# 2. Clone & create virtual environment
git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git
cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Ingest and verify dataset
python3 download_dataset.py
python3 download_dataset.py --check

# 5. Execute deterministic ML pipelines
python3 training_pipeline.py
python3 build_models_and_predictions.py
python3 generate_results_json.py

# 6. Launch Model Server & Interactive Web Portal
chmod +x run_portal.sh
./run_portal.sh
# (Starts model_server.py in background with graceful SIGINT cleanup and runs portal on :3000)
```
<!-- slide -->
```bash
# ====================================================================
# macOS (Apple Silicon M1-M4 & Intel x86_64)
# ====================================================================

# 1. Install prerequisites via Homebrew
# NOTE: libomp is required for OpenMP multi-threading in XGBoost on macOS
brew install python@3.11 node libomp unzip

# 2. Clone & create virtual environment
git clone https://github.com/mehulpatil17/Walmart-Weekly-Sales-Forecasting-by-Store-and-Department.git
cd Walmart-Weekly-Sales-Forecasting-by-Store-and-Department
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Ingest and verify dataset
python3 download_dataset.py
python3 download_dataset.py --check

# 5. Execute deterministic ML pipelines
python3 training_pipeline.py
python3 build_models_and_predictions.py
python3 generate_results_json.py

# 6. Launch Model Server & Interactive Web Portal
chmod +x run_portal.sh
./run_portal.sh
```
````

---

### Dataset Integrity & Expected Checksums

| File | Rows | Columns | Expected Size | Description |
|---|---|---|---|---|
| `data/train.csv` | 421,570 | 5 | ~12.8 MB | Historical Sales Ground Truth (Feb 2010 – Oct 2012) |
| `data/features.csv` | 8,190 | 12 | ~592 KB | Macroeconomic indicators & Promotional Markdowns |
| `data/stores.csv` | 45 | 3 | ~532 bytes | Store Metadata (Format Type A/B/C & Square Footage) |
| `data/test.csv` | 115,064 | 4 | ~2.60 MB | Official Kaggle competition evaluation set |

---

## Project Structure

| File / Directory | Purpose |
|---|---|
| `walmart_sales_forecasting.ipynb` | End-to-end reproducible Jupyter Notebook walking through data ingestion, EDA, leakage-free preprocessing, model evaluation, and failure audits |
| `training_pipeline.py` | End-to-end leakage-free training with chronological OOT split |
| `build_models_and_predictions.py` | Multi-model benchmark (baselines + Ridge + RF + XGBoost) |
| `download_dataset.py` | Cross-platform automated dataset downloader, recursive extractor, and integrity validator |
| `run_portal.bat` | Windows one-click launcher for background model server and Next.js portal |
| `run_portal.sh` | Linux & macOS unified launcher with process trapping and graceful shutdown |
| `generate_results_json.py` | Generates single-source `results.json` for the portal |
| `model_server.py` | Lightweight zero-dependency HTTP model server serving live XGBoost predictions on port 5001 |
| `reports/` | Academic coursework reports (EDA report, evaluation report, model recommendation, course prompt) |
| `PROJECT_FILE_INVENTORY.md` | Full repository file index with purpose, technical role, and status for each file |
| `portal/` | Next.js interactive research dashboard |
| `data/` | Raw Kaggle CSV files (download via `download_dataset.py` or Kaggle CLI) |
| `models/` | Trained model checkpoints (regenerate via `training_pipeline.py`) |

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

## Citations & Academic References

1. **Chen, T., & Guestrin, C. (2016).** XGBoost: A Scalable Tree Boosting System. In *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 785–794).
2. **Breiman, L. (2001).** Random Forests. *Machine Learning*, 45(1), 5–32.
3. **Pedregosa, F., et al. (2011).** Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research (JMLR)*, 12, 2825–2830.
4. **Walmart Inc. / Kaggle (2014).** Walmart Recruiting - Store Sales Forecasting. Kaggle Competition Dataset. https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting

---

## License & Ethics

- Dataset used under Kaggle competition terms.
- No private student data, API keys, or credentials are published.
- Forecasts reflect historical correlations, not causal effects.
