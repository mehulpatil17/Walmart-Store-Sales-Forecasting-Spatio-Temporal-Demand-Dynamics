# Walmart Sales Forecasting & Research Portal — Project File Inventory

This document provides a comprehensive directory of every file and folder in this repository. It details each file's purpose, its role within the end-to-end Machine Learning pipeline and web application, its necessity status, and highlights files that are **redundant or not required**.

---

## 1. System Architecture Overview

The repository is structured into four functional layers:
1. **Raw Data & Feature Engineering**: Tabular datasets (`data/`) and scripts that extract features, compute empirical statistics, and create train/holdout splits.
2. **Machine Learning Pipelines & Models**: Training routines (`training_pipeline.py`, `build_models_and_predictions.py`), hyperparameter tuning outputs, and serialized model binaries (`models/`).
3. **Model Serving Backend**: Lightweight Python HTTP microservice (`model_server.py`) serving live predictions from the champion model.
4. **Interactive Web Portal**: Next.js 16 + React 19 web application (`portal/`) deployed to GitHub Pages and capable of connecting to the local backend.

---

## 2. Master File Inventory

### A. Root Python Scripts & Execution Pipelines

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `model_server.py` | 8.6 KB | **High-performance HTTP Model Server** running on `http://127.0.0.1:5001`. Loads `models/xgboost_model.joblib` and `history_actuals.parquet` into memory, computes real-time predictions, 95% confidence intervals, and demand risk explanations for the web portal. | **REQUIRED** for live model inference from the webpage. |
| `run_portal.bat` | 414 B | **Windows Double-Click Launcher**. Concurrently starts the Python `model_server.py` microservice in the background and launches the Next.js portal on `http://localhost:3000`. | **REQUIRED (Convenience)** for local single-step execution. |
| `training_pipeline.py` | 18.9 KB | **End-to-End Training Pipeline**. Contains full pipeline code: missing value imputation, cyclical date features, holiday surge flags, out-of-fold target encodings, Optuna hyperparameter tuning, model fitting, and Kaggle submission generation. | **Source Code (Required for retraining)**. Not needed to *run* the web app. |
| `build_models_and_predictions.py` | 11.3 KB | **Multi-Model Benchmark & Prediction Generator**. Trains all baseline models (Median, Lag-1, Lag-52), Ridge Regression, Random Forest, and XGBoost. Generates `holdout_predictions.parquet`, `history_actuals.parquet`, and `metrics_summary.json`. | **Source Code (Required for retraining)**. Not needed to *run* the web app. |
| `generate_results_json.py` | 45.0 KB | **Data Distillation Pipeline**. Computes and writes the unified `results.json` powering the Next.js web application (both `portal/src/data/results.json` and `portal/public/data/results.json`). Contains benchmark tables, ablation data, and oral defense Q&As. | **Source Code (Pipeline)**. Only needed when updating project metrics or web portal data. |
| `compute_empirical_stats.py` | 11.5 KB | **Data Distribution Analyzer**. Computes empirical percentiles, department/store distributions, holiday ratios, and generates `empirical_diagnostics.json`. | **Source Code (Analysis)**. Not needed at runtime. |

---

### B. Machine Learning Checkpoints & Serialized Models

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `models/xgboost_model.joblib` | 21.8 MB | **Champion Model Binary**. Trained depth-wise Gradient Boosted Decision Tree (XGBoost) model serialized with Joblib. Loaded directly by `model_server.py` for live inference. | **CRITICAL / REQUIRED**. Must not be deleted. |
| `best_xgboost_checkpoint.joblib` | 21.7 MB | **Redundant Root Checkpoint**. Checkpoint dumped to the root folder by `training_pipeline.py`. The active application and server load `models/xgboost_model.joblib`. | **NOT REQUIRED (Redundant)**. Safe to delete. |
| `models/rf_model.joblib` | 114.3 MB | **Random Forest Baseline Model**. 100-tree bagged ensemble model trained in `build_models_and_predictions.py`. Its holdout predictions are already pre-computed and stored in `holdout_predictions.parquet`. | **NOT REQUIRED at runtime**. Heavy binary (114 MB) only needed if reusing the raw RF model. |
| `models/ridge_model.joblib` | 2.7 KB | **Ridge Regression Baseline Model**. L2-regularized linear model with StandardScaler. Its holdout predictions are already saved in `holdout_predictions.parquet`. | **Optional / Archival**. Not needed to run the website or server. |

---

### C. Data Files & Datasets

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `history_actuals.parquet` | 1.99 MB | **Historical Training Actuals**. Serialized DataFrame of past weekly sales per Store-Dept. Used by `model_server.py` to calculate target encodings and departmental historical averages dynamically for live user queries. | **CRITICAL / REQUIRED**. Used by `model_server.py`. |
| `holdout_predictions.parquet` | 5.56 MB | **39-Week Holdout Predictions**. Row-by-row prediction table across all 8 models/baselines alongside actual sales. Powers offline residual analysis and error inspection. | **Analytical Artifact**. Retain for evaluation. (Portal uses distilled `results.json`). |
| `data/stores.csv` | 532 B | **Store Metadata**. Contains store type (A/B/C) and store floor area in square feet for all 45 stores. | **Raw Data (Required for training)**. |
| `data/train.csv/train.csv` | 12.8 MB | **Historical Sales Dataset**. 421,570 weekly sales records from Feb 2010 to Oct 2012 across 45 stores and 81 departments. | **Raw Data (Required for training)**. |
| `data/features.csv/features.csv` | 592 KB | **Macroeconomic & Markdown Features**. Weekly temperature, fuel price, CPI, unemployment, and MarkDown 1–5 values. | **Raw Data (Required for training)**. |
| `data/test.csv/test.csv` | 2.6 MB | **Kaggle Test Dataset**. 115,064 records from Nov 2012 to Jul 2013 for Kaggle test set prediction. | **Raw Data (Kaggle Evaluation)**. |
| `data/sampleSubmission.csv/sampleSubmission.csv` | 2.1 MB | **Kaggle Submission Format**. Template defining the required structure for Kaggle submissions. | **NOT REQUIRED**. Template only; safe to delete. |
| `submission.csv` | 3.14 MB | **Generated Kaggle Submission File**. The final prediction file formatted for Kaggle evaluation. | **NOT REQUIRED for app/model**. Competition deliverable only. |

---

### D. Benchmark Results, Configurations & Metrics (JSON / CSV / PNG)

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `best_tuned_params.json` | 418 B | **Optuna Optimal Hyperparameters**. Best hyperparameters discovered for the champion XGBoost model (`n_estimators`, `max_depth`, `learning_rate`, `subsample`, `colsample_bytree`, `reg_alpha`, `reg_lambda`). | **Configuration Artifact**. Useful reference. |
| `metrics_summary.json` | 4.2 KB | **Comprehensive Metric Scorecard**. WMAE, MAE, RMSE, and Holiday Error Ratios across all evaluated models for overall, holiday, and regular periods. | **Metrics Artifact**. Useful reference. |
| `model_comparison.csv` | 888 B | **Model Comparison Table**. CSV summary of all 8 models compared on WMAE, MAE, RMSE, R², and compute time. | **Summary Artifact**. Useful reference. |
| `hyperparameter_recommendations.json` | 9.6 KB | **Hyperparameter Study Logs**. Search bounds, trial evaluations, and convergence records from Optuna tuning. | **Research Artifact**. Not needed at runtime. |
| `empirical_diagnostics.json` | 10.4 KB | **Data Distribution Diagnostics**. Store/department summary statistics, percentiles, and skewness metrics generated by `compute_empirical_stats.py`. | **Research Artifact**. Not needed at runtime. |
| `training_curves.png` | 488 KB | **Static Learning Curve Plot**. Matplotlib plot showing training vs. validation loss across boosting iterations. | **NOT REQUIRED**. The web portal renders interactive SVG/Recharts curves natively. |

---

### E. Documentation & Academic Reports

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `README.md` | 8.9 KB | **Project Readme**. Primary repository landing page featuring live site links, benchmark comparison table, architecture diagrams, and usage instructions. | **REQUIRED** repository documentation. |
| `dataset_analysis_report.md` | 13.6 KB | **Exploratory Data Analysis (EDA) Report**. In-depth report covering dataset structure, missing data handling, markdown sparsity, holiday spikes, and distribution diagnostics. | **Academic Deliverable**. Course project report. |
| `evaluation_report.md` | 8.5 KB | **Formal Evaluation Report**. Statistical evaluation comparing candidate models against baselines, bootstrap confidence intervals, and paired hypothesis testing results. | **Academic Deliverable**. Course project report. |
| `final_model_recommendation.md` | 7.5 KB | **Model Recommendation & Deployment Report**. Final architectural justification, deployment constraints, and non-causal forecasting disclaimers. | **Academic Deliverable**. Course project report. |
| `project_guide_text.txt` | 28.1 KB | **Course Guide & Prompt Text**. Original course problem statement, phase requirements, and grading criteria for ES 335. | **Reference Material**. Not needed for runtime/code. |
| `requirements.txt` | 271 B | **Python Dependencies**. Lists exact Python libraries needed for the ML training pipeline and model server (`xgboost`, `pandas`, `joblib`, etc.). | **REQUIRED** for setting up the Python environment. |
| `.gitignore` | 539 B | **Git Ignore Configuration**. Specifies files and directories that Git should ignore (virtual environments, caches, OS files). | **REQUIRED** for Git repository maintenance. |

---

### F. CI/CD & GitHub Configuration

| File Name | Size | Purpose & Technical Role | Status / Necessity |
|---|---|---|---|
| `.github/workflows/deploy.yml` | 1.2 KB | **GitHub Actions Deployment Workflow**. Automatically builds the Next.js static site on push to `main` and deploys it to GitHub Pages. | **REQUIRED** for live website deployment. |

---

### G. Next.js Web Portal (`portal/`)

| File / Folder | Purpose & Technical Role | Status / Necessity |
|---|---|---|
| `portal/package.json` | Node project configuration defining dependencies (`next`, `react`, `lucide-react`, `tailwindcss`) and build scripts. | **REQUIRED** for web portal build and execution. |
| `portal/package-lock.json` | Lockfile ensuring deterministic dependency installation across environments. | **REQUIRED** for web portal build. |
| `portal/tsconfig.json` | TypeScript compiler configuration for the Next.js portal. | **REQUIRED** for web portal build. |
| `portal/next.config.ts` | Next.js build configuration (sets static export `output: 'export'` and repository base path for GitHub Pages). | **REQUIRED** for web portal build. |
| `portal/eslint.config.mjs` | ESLint configuration for code quality and linting. | **Dev Config**. |
| `portal/src/data/results.json` | **Single Source of Truth (410 KB)**. Master data file containing benchmark numbers, model configs, cohort overlap, and oral defense Q&As imported directly into React pages. | **CRITICAL / REQUIRED** for web portal. |
| `portal/public/data/results.json` | Publicly accessible duplicate of `results.json` used for client-side fetches. | **REQUIRED** for web portal runtime. |
| `portal/src/app/page.tsx` | **Main Research Overview (Route `/`)**. Landing dashboard with KPI cards, model ladder, error-tolerance slider, confusion matrix, and team credits. | **REQUIRED** web portal page. |
| `portal/src/app/studio/page.tsx` | **Data Studio (Route `/studio`)**. Interactive Store/Dept trajectory explorer across the 39-week holdout, cohort overlap matrix, and group-by aggregations. | **REQUIRED** web portal page. |
| `portal/src/app/predictor/page.tsx` | **Model Predictor (Route `/predictor`)**. Real-time what-if forecasting simulator. Connects to `model_server.py` with client-side fallback surrogate. | **REQUIRED** web portal page. |
| `portal/src/app/qna/page.tsx` | **Oral Defense (Route `/qna`)**. Academic defense portal with 16 categorized Q&As, search filters, and student contributions. | **REQUIRED** web portal page. |
| `portal/src/app/layout.tsx` | Root layout component providing font setup, metadata, and theme context. | **REQUIRED** web portal layout. |
| `portal/src/app/globals.css` | Global styles and Tailwind CSS directives. | **REQUIRED** styling. |
| `portal/src/components/*` | Reusable React UI components (`Header.tsx`, `Sidebar.tsx`, `MainLayout.tsx`, `ThemeToggle.tsx`, etc.). | **REQUIRED** components. |
| `portal/src/types/index.ts` | TypeScript interface definitions for all results data structures. | **REQUIRED** types. |
| `portal/public/*.svg` | Icons and logos (SVG assets). | Assets. |
| `portal/README.md` & `AGENTS.md` | Web portal documentation and developer guidelines. | Documentation. |

---

## 3. Files and Folders That Are NOT Required

The following files and directories can be safely **deleted or ignored** without impacting the trained ML models, the Python prediction server, or the web application:

| File / Directory | Size | Reason It Is NOT Required | Safe Action |
|---|---|---|---|
| `best_xgboost_checkpoint.joblib` | 21.7 MB | **Redundant Model Checkpoint**. A duplicate dump from `training_pipeline.py`. The active microservice (`model_server.py`) uses `models/xgboost_model.joblib`. | **Safe to delete**. Saves ~22 MB of disk space. |
| `models/rf_model.joblib` | 114.3 MB | **Baseline Model Binary**. Large Random Forest ensemble checkpoint. All holdout predictions from this model are already pre-computed in `holdout_predictions.parquet` and `results.json`. The server only runs the champion XGBoost model. | **Safe to archive or delete**. Saves ~114 MB of disk space. |
| `catboost_info/` | ~150 KB | **Auto-Generated Training Telemetry**. Directory automatically generated by CatBoost during model fitting containing TSV logs and TensorBoard events. | **Safe to delete**. |
| `__pycache__/` | ~50 KB | **Python Bytecode Cache**. Auto-generated `.pyc` files created when Python scripts run. | **Safe to delete**. Automatically regenerated when scripts run. |
| `submission.csv` | 3.14 MB | **Kaggle Submission Export**. Output file formatted for Kaggle leaderboard submission. Neither the web app nor the model server uses this file. | **Safe to delete or archive**. |
| `training_curves.png` | 488 KB | **Static PNG Image**. A static plot of training loss. The Next.js web portal renders dynamic, interactive charts directly in React. | **Safe to delete**. |
| `data/sampleSubmission.csv` | 2.1 MB | **Kaggle Sample Submission Template**. Empty submission template provided by Kaggle; not used anywhere in code or web pages. | **Safe to delete**. |
| `project_guide_text.txt` | 28.1 KB | **Instructor Assignment Text**. Raw course syllabus / prompt text. Not imported or referenced by any code. | **Optional / Can be archived**. |
| `portal/.next/` | ~150 MB | **Next.js Build Cache**. Temporary compilation directory generated when running `npm run build` or `npm run dev`. | **Safe to delete**. Regenerated on build. |
| `portal/out/` | ~5 MB | **Static Export Directory**. Output folder produced by `next build` containing static HTML/JS for GitHub Pages. | **Build Artifact**. Handled automatically by GitHub Actions CI/CD. |

---

## 4. Minimal Runtime Footprints

### A. To Run Just the ML Model & Web Application Locally
If you want to run the prediction server and web application with the absolute minimum number of files, you only need:
1. `model_server.py`
2. `models/xgboost_model.joblib`
3. `history_actuals.parquet`
4. `run_portal.bat`
5. `portal/` folder (excluding `.next` and `out`)

### B. To Retrain the Models from Scratch
If you want to re-execute the training pipelines, you need:
1. `data/` (`stores.csv`, `train.csv/train.csv`, `features.csv/features.csv`)
2. `training_pipeline.py` and `build_models_and_predictions.py`
3. `requirements.txt`
