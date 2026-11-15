# Walmart Weekly Sales Forecasting by Store and Department — Project File Inventory

This document provides a comprehensive directory of every file and folder in this repository. It details each file's purpose, its role within the end-to-end Machine Learning pipeline and web application, its status as a runtime component or proof of work, and notes on removed redundant files.

---

## 1. System Architecture Overview

The repository is organized into distinct, modular functional layers:
1. **Raw Data & Feature Engineering**: Tabular datasets (`data/`) and scripts that extract temporal features, compute empirical statistics, and create leakage-free train/holdout splits.
2. **Machine Learning Pipelines & Models**: Training pipelines (`training_pipeline.py`, `build_models_and_predictions.py`), Jupyter notebook (`walmart_sales_forecasting.ipynb`), hyperparameter tuning logs, and serialized model binaries (`models/`).
3. **Model Serving Backend**: Lightweight Python HTTP microservice (`model_server.py`) serving live predictions from the champion XGBoost model.
4. **Interactive Web Portal**: Next.js 16 + React 19 web application (`portal/`) deployed to GitHub Pages and capable of connecting to the local backend.
5. **Coursework Reports & Academic Proof of Work**: Academic reports, EDA findings, evaluation writeups, and project rubric stored in `reports/`.

---

## 2. Master File Inventory

### A. Python Source Code, Pipelines & Notebooks

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `model_server.py` | 8.6 KB | **High-performance HTTP Model Server** running on `http://127.0.0.1:5001`. Loads `models/xgboost_model.joblib` and `history_actuals.parquet` into memory, computes real-time predictions, 95% confidence intervals, and demand risk explanations for the web portal. | **REQUIRED (Runtime Backend)** for live model inference from the webpage. |
| `run_portal.bat` | 414 B | **Windows Double-Click Launcher**. Concurrently starts the Python `model_server.py` microservice in the background and launches the Next.js portal on `http://localhost:3000`. | **REQUIRED (Convenience)** for single-click execution. |
| `walmart_sales_forecasting.ipynb` | 20.3 KB | **End-to-End Jupyter Notebook**. Interactive walkthrough demonstrating data ingestion, exploratory data analysis, leakage-free feature engineering, model training, evaluation, and failure case audits. | **Proof of Work (Interactive ML)**. Retained as coursework demonstration. |
| `training_pipeline.py` | 18.9 KB | **End-to-End Training Pipeline**. Standalone CLI pipeline: missing value imputation, cyclical date features, holiday surge flags, out-of-fold target encodings, Optuna hyperparameter tuning, model fitting, and Kaggle submission generation. | **Source Code (Pipeline)**. Required for retraining. |
| `build_models_and_predictions.py` | 11.3 KB | **Multi-Model Benchmark & Prediction Generator**. Trains all baseline models (Median, Lag-1, Lag-52), Ridge Regression, Random Forest, and XGBoost. Generates `holdout_predictions.parquet`, `history_actuals.parquet`, and `metrics_summary.json`. | **Source Code (Pipeline)**. Required for retraining. |
| `generate_results_json.py` | 45.0 KB | **Data Distillation Pipeline**. Computes and writes the unified `results.json` powering the Next.js web application (both `portal/src/data/results.json` and `portal/public/data/results.json`). Contains benchmark tables, ablation data, and oral defense Q&As. | **Source Code (Pipeline)**. Used when updating project metrics. |
| `compute_empirical_stats.py` | 11.5 KB | **Data Distribution Analyzer**. Computes empirical percentiles, department/store distributions, holiday ratios, and generates `empirical_diagnostics.json`. | **Source Code (Analysis)**. Used for dataset diagnostics. |

---

### B. Machine Learning Checkpoints & Models (`models/`)

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `models/xgboost_model.joblib` | 21.8 MB | **Champion Model Binary**. Trained depth-wise Gradient Boosted Decision Tree (XGBoost) model serialized with Joblib. Loaded directly by `model_server.py` for live inference. | **CRITICAL / REQUIRED (Active Model)**. |
| `models/rf_model.joblib` | 114.3 MB | **Random Forest Baseline Model**. 100-tree bagged ensemble model trained in `build_models_and_predictions.py`. | **Proof of Work (Trained Baseline Binary)**. Retained as evidence of multi-model training. |
| `models/ridge_model.joblib` | 2.7 KB | **Ridge Regression Baseline Model**. L2-regularized linear model with StandardScaler. | **Proof of Work (Trained Baseline Binary)**. Retained as evidence of linear baseline training. |

---

### C. Data Files & Datasets (`data/` and Root Parquet)

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `history_actuals.parquet` | 1.99 MB | **Historical Training Actuals**. Serialized DataFrame of past weekly sales per Store-Dept. Used by `model_server.py` to calculate target encodings and departmental historical averages dynamically for live user queries. | **CRITICAL / REQUIRED (Server Dependency)**. |
| `holdout_predictions.parquet` | 5.56 MB | **39-Week Holdout Predictions**. Row-by-row prediction table across all 8 models/baselines alongside actual sales. Powers offline residual analysis and error inspection. | **Proof of Work (Holdout Results)**. Retained as comprehensive validation proof. |
| `data/stores.csv` | 532 B | **Store Metadata**. Contains store type (A/B/C) and store floor area in square feet for all 45 stores. | **Raw Data (Required for training)**. |
| `data/train.csv/train.csv` | 12.8 MB | **Historical Sales Dataset**. 421,570 weekly sales records from Feb 2010 to Oct 2012 across 45 stores and 81 departments. | **Raw Data (Required for training)**. |
| `data/features.csv/features.csv` | 592 KB | **Macroeconomic & Markdown Features**. Weekly temperature, fuel price, CPI, unemployment, and MarkDown 1–5 values. | **Raw Data (Required for training)**. |
| `data/test.csv/test.csv` | 2.6 MB | **Kaggle Test Dataset**. 115,064 records from Nov 2012 to Jul 2013 for Kaggle test set prediction. | **Raw Data (Kaggle Evaluation)**. |

---

### D. Benchmark Results, Configurations & Metrics (JSON / CSV / PNG)

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `submission.csv` | 3.14 MB | **Generated Kaggle Submission File**. The final prediction file formatted for Kaggle competition evaluation. | **Proof of Work (Competition Submission)**. Demonstrates complete pipeline execution through to test predictions. |
| `training_curves.png` | 488 KB | **Static Learning Curve Plot**. Matplotlib plot showing training vs. validation loss across boosting iterations. | **Proof of Work (Visualization)**. Shows training convergence and lack of overfitting. |
| `best_tuned_params.json` | 418 B | **Optuna Optimal Hyperparameters**. Best hyperparameters discovered for the champion XGBoost model (`n_estimators`, `max_depth`, `learning_rate`, `subsample`, `colsample_bytree`, `reg_alpha`, `reg_lambda`). | **Proof of Work (Tuning Output)**. |
| `metrics_summary.json` | 4.2 KB | **Comprehensive Metric Scorecard**. WMAE, MAE, RMSE, and Holiday Error Ratios across all evaluated models for overall, holiday, and regular periods. | **Proof of Work (Evaluation Output)**. |
| `model_comparison.csv` | 888 B | **Model Comparison Table**. CSV summary of all 8 models compared on WMAE, MAE, RMSE, R², and compute time. | **Proof of Work (Benchmark Summary)**. |
| `hyperparameter_recommendations.json` | 9.6 KB | **Hyperparameter Study Logs**. Search bounds, trial evaluations, and convergence records from Optuna tuning. | **Proof of Work (Tuning History)**. |
| `empirical_diagnostics.json` | 10.4 KB | **Data Distribution Diagnostics**. Store/department summary statistics, percentiles, and skewness metrics generated by `compute_empirical_stats.py`. | **Proof of Work (Distribution Stats)**. Used by `generate_results_json.py`. |

---

### E. Coursework Reports & Documentation (`reports/` and Root)

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `reports/dataset_analysis_report.md` | 13.6 KB | **Exploratory Data Analysis (EDA) Report**. In-depth academic report covering dataset structure, missing data handling, markdown sparsity, holiday spikes, and distribution diagnostics. | **Proof of Work (Coursework Report)**. |
| `reports/evaluation_report.md` | 8.5 KB | **Formal Evaluation Report**. Statistical evaluation comparing candidate models against baselines, bootstrap confidence intervals, and paired hypothesis testing results. | **Proof of Work (Coursework Report)**. |
| `reports/final_model_recommendation.md` | 7.5 KB | **Model Recommendation & Deployment Report**. Final architectural justification, deployment constraints, and non-causal forecasting disclaimers. | **Proof of Work (Coursework Report)**. |
| `reports/project_guide_text.txt` | 28.1 KB | **Course Guide & Prompt Text**. Original course problem statement, phase requirements, and grading criteria for ES 335. | **Proof of Work (Project Specifications)**. |
| `README.md` | 9.5 KB | **Project Readme**. Primary repository landing page featuring live site links, benchmark comparison table, architecture diagrams, academic citations, and setup instructions. | **REQUIRED (Repository Documentation)**. |
| `PROJECT_FILE_INVENTORY.md` | Current | **Complete File Inventory**. Detailed purpose, categorization, and necessity mapping for all repository files. | **REQUIRED (Documentation)**. |
| `requirements.txt` | 271 B | **Python Dependencies**. Lists exact Python libraries needed for the ML training pipeline and model server (`xgboost`, `pandas`, `joblib`, etc.). | **REQUIRED (Environment Setup)**. |
| `.gitignore` | 539 B | **Git Ignore Configuration**. Specifies files and directories that Git should ignore (virtual environments, caches, OS files). | **REQUIRED (Version Control)**. |

---

### F. CI/CD & Deployment Configuration

| File Name | Size | Purpose & Technical Role | Status / Classification |
|---|---|---|---|
| `.github/workflows/deploy.yml` | 1.2 KB | **GitHub Actions Deployment Workflow**. Automatically builds the Next.js static site on push to `main` and deploys it to GitHub Pages. | **REQUIRED (CI/CD)**. |

---

### G. Next.js Web Portal (`portal/`)

| File / Folder | Purpose & Technical Role | Status / Classification |
|---|---|---|
| `portal/package.json` | Node project configuration defining dependencies (`next`, `react`, `lucide-react`, `tailwindcss`) and build scripts. | **REQUIRED (Web App Config)**. |
| `portal/package-lock.json` | Lockfile ensuring deterministic dependency installation across environments. | **REQUIRED (Web App Config)**. |
| `portal/tsconfig.json` | TypeScript compiler configuration for the Next.js portal. | **REQUIRED (Web App Config)**. |
| `portal/next.config.ts` | Next.js build configuration (sets static export `output: 'export'` and repository base path for GitHub Pages). | **REQUIRED (Web App Config)**. |
| `portal/eslint.config.mjs` | ESLint configuration for code quality and linting. | **REQUIRED (Web App Config)**. |
| `portal/src/data/results.json` | **Single Source of Truth (410 KB)**. Master data file containing benchmark numbers, model configs, cohort overlap, and oral defense Q&As imported directly into React pages. | **CRITICAL / REQUIRED (Web App Data)**. |
| `portal/public/data/results.json` | Publicly accessible duplicate of `results.json` used for client-side fetches. | **REQUIRED (Web App Data)**. |
| `portal/src/app/page.tsx` | **Main Research Overview (Route `/`)**. Landing dashboard with KPI cards, model ladder, error-tolerance slider, confusion matrix, citations, and team credits. | **REQUIRED (Web App Page)**. |
| `portal/src/app/studio/page.tsx` | **Data Studio (Route `/studio`)**. Interactive Store/Dept trajectory explorer across the 39-week holdout, cohort overlap matrix, and group-by aggregations. | **REQUIRED (Web App Page)**. |
| `portal/src/app/predictor/page.tsx` | **Model Predictor (Route `/predictor`)**. Real-time what-if forecasting simulator. Connects to `model_server.py` with client-side fallback surrogate. | **REQUIRED (Web App Page)**. |
| `portal/src/app/qna/page.tsx` | **Oral Defense (Route `/qna`)**. Academic defense portal with 16 categorized Q&As, search filters, and student contributions. | **REQUIRED (Web App Page)**. |
| `portal/src/app/layout.tsx` | Root layout component providing font setup, metadata, and theme context. | **REQUIRED (Web App Layout)**. |
| `portal/src/app/globals.css` | Global styles and Tailwind CSS directives. | **REQUIRED (Web App Styling)**. |
| `portal/src/components/*` | Reusable React UI components (`Header.tsx`, `Sidebar.tsx`, `MainLayout.tsx`, `ThemeToggle.tsx`, etc.). | **REQUIRED (Web App Components)**. |
| `portal/src/types/index.ts` | TypeScript interface definitions for all results data structures. | **REQUIRED (Web App Types)**. |
| `portal/public/*.svg` | Icons and logos (SVG assets). | **REQUIRED (Web App Assets)**. |
| `portal/README.md` & `AGENTS.md` | Web portal documentation and developer guidelines. | Documentation. |

---

## 3. Summary of Cleanup Performed

The following redundant, non-proof-of-work files and temporary caches have been permanently removed:

| Removed Item | Former Size | Classification | Why It Was Safely Deleted |
|---|---|---|---|
| `best_xgboost_checkpoint.joblib` | 21.7 MB | Redundant Root Duplicate | Pure duplicate of `models/xgboost_model.joblib`. The active server loads the checkpoint inside `models/`. |
| `catboost_info/` | ~150 KB | Temporary Telemetry | Auto-generated by CatBoost during model fitting (contained TSV logs and TensorBoard event files). Already ignored by `.gitignore`. |
| `__pycache__/` | ~50 KB | Bytecode Cache | Disposable compiled Python bytecode (`*.pyc`). Automatically recreated on demand. |
| `data/sampleSubmission.csv/` | 2.1 MB | Empty Competition Template | Generic empty Kaggle sample file. The real generated test predictions are preserved in `submission.csv`. |

### Important Work Retained as Proof of Work
- **Trained Model Binaries (`models/rf_model.joblib`, `models/ridge_model.joblib`)**: Kept as physical evidence of multi-model training.
- **Kaggle Submission (`submission.csv`)**: Kept as direct proof of test set inference execution.
- **Training Visualizations (`training_curves.png`)**: Kept as proof of model loss convergence.
- **Validation Holdout Predictions (`holdout_predictions.parquet`)**: Kept as complete evaluation evidence across 115k samples.
- **Coursework Reports (`reports/`)**: Grouped into a dedicated `reports/` folder for clean presentation.
- **Reproducible Notebook (`walmart_sales_forecasting.ipynb`)**: Kept for interactive demonstration.
