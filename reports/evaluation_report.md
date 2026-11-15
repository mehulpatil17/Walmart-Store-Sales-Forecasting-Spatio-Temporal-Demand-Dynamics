# Comprehensive Model Evaluation & Diagnostic Report
**Project:** Walmart Weekly Sales Forecasting by Store and Department  
**Dataset:** Walmart Recruiting - Store Sales Forecasting (Kaggle)  
**Author:** Senior Machine Learning Engineer, Data Scientist & ML Researcher  
**Date:** October 2026  
**Artifact Referenced:** `../training_curves.png`, `../model_comparison.csv`

---

## Executive Summary

This report documents the rigorous empirical evaluation of multiple distinct model families for the Walmart Store Sales Forecasting task. Experiments were conducted under a strict, leak-free **Chronological Out-of-Time (OOT) Split** (104 weeks of training from 2010-02-05 to 2012-01-27, and 39 weeks of validation from 2012-02-03 to 2012-10-26, exactly matching the 39-week duration of the official test set).

All models were evaluated on the competition-standard **Weighted Mean Absolute Error (WMAE)** alongside Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and the Coefficient of Determination ($R^2$).

---

## 1. Experimental Methodology & Validation Protocol

### 1.1 Out-of-Time Splitting Strategy
- **Training Set:** 305,982 records across 104 contiguous weeks (~24 calendar months).
- **Validation Holdout:** 115,588 records across 39 contiguous weeks (~9 calendar months).
- **Official Test Set:** 115,064 records across 39 contiguous weeks (kept completely untouched during model training and hyperparameter search).
- **Strict Leakage Prevention:**
  1. Historical target encodings (`dept_mean`, `dept_median`, `store_mean`, `store_median`, `sd_mean`, `sd_median`, `dw_median`) were computed **strictly inside the training partition**.
  2. Imputation statistics for macroeconomic variables (`CPI` and `Unemployment`) were fitted on training data and forward-filled chronologically.
  3. No random K-Fold cross-validation was used, completely eliminating future-to-past lookahead leakage.

### 1.2 Evaluation Metrics
- **WMAE (Weighted Mean Absolute Error):**
  $$\text{WMAE} = \frac{\sum_{i=1}^n w_i |y_i - \hat{y}_i|}{\sum_{i=1}^n w_i}, \quad w_i = \begin{cases} 5.0 & \text{if } \text{IsHoliday}_i = 1 \\ 1.0 & \text{if } \text{IsHoliday}_i = 0 \end{cases}$$
- **Generalization Gap:** $\Delta_{\text{Gen}} = \text{WMAE}_{\text{Val}} - \text{WMAE}_{\text{Train}}$.
- **$R^2$ (Explained Variance):** Measures the proportion of variance in weekly sales captured by the model.

---

## 2. Quantitative Model Comparison

The following experimental results were recorded across all evaluated candidate models:

| Model Architecture | Model Family | Train WMAE ($) | Val WMAE ($) | Generalization Gap ($) | Val MAE ($) | Val RMSE ($) | Val $R^2$ | Train Time (s) | Infer Time (s) | Diagnostic Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **Store-Dept Median Baseline** | Heuristic Baseline | 2,184.15 | 2,423.62 | +239.47 | 2,352.97 | 4,682.10 | 0.9512 | 0.05 | 0.02 | Baseline Reference |
| **Ridge Regression** | Regularized Linear | 2,406.23 | 2,506.24 | **+100.01** | 2,483.67 | 4,561.80 | 0.9577 | **1.63** | 0.43 | Severe Underfitting (High Bias) |
| **CatBoost Regressor** | Oblivious Trees | 1,486.99 | 1,841.93 | +354.94 | 1,821.98 | 3,833.50 | 0.9701 | 19.65 | **0.05** | Moderate Underfitting |
| **Random Forest Regressor** | Bagged Trees | 1,257.07 | 1,730.04 | +472.97 | 1,718.29 | 3,526.26 | 0.9747 | 51.83 | 0.33 | Well Regularized |
| **LightGBM Regressor** | Leaf-wise GBDT | 1,158.55 | 1,736.87 | +578.31 | 1,723.84 | 3,699.59 | 0.9721 | 85.97 | 2.25 | Strong Candidate |
| **XGBoost (Default)** | Depth-wise GBDT | 1,047.66 | 1,692.80 | +645.14 | 1,685.12 | 3,536.54 | 0.9746 | 13.65 | 0.60 | Top Baseline Candidate |
| **XGBoost (Optuna Tuned)** | Depth-wise GBDT | **882.24** | **1,616.78** | +734.54 | **1,606.97** | **3,399.11** | **0.9765** | 16.75 | 0.47 | **Selected Optimal Model** |

---

## 3. In-Depth Diagnostic Analysis: Overfitting vs. Underfitting

### 3.1 Ridge Regression: Severe Underfitting (High Bias)
- **Diagnostic Metrics:** Train WMAE of $\$2,406.23$ and Val WMAE of $\$2,506.24$.
- **Generalization Gap:** Minimal ($\$100.01$), which in naive analysis might appear desirable.
- **Root Cause:** A linear hyperplane cannot model the multiplicative interactions between store type, store size, and seasonal departmental surges. For instance, Dept 72 (Electronics/Toys) experiences a $30\times$ sales multiplier during Thanksgiving (Week 47), whereas Dept 47 experiences zero lift. Linear models suffer from **high structural bias**, underfitting both training and validation sets.

### 3.2 CatBoost Regressor: Moderate Inductive Bias
- **Diagnostic Metrics:** Train WMAE of $\$1,486.99$, Val WMAE of $\$1,841.93$.
- **Root Cause:** CatBoost relies on **oblivious (symmetric) decision trees**, where every node at the same tree depth uses the exact same split criterion. While this symmetry acts as an inductive regularizer against overfitting, it restricts the tree from growing highly asymmetric, specialized sub-trees for individual outlier departments. Consequently, CatBoost underperformed both Random Forest and XGBoost on holiday spikes.

### 3.3 Random Forest: Robust Bagged Variance Reduction
- **Diagnostic Metrics:** Train WMAE of $\$1,257.07$, Val WMAE of $\$1,730.04$, Val RMSE of $\$3,526.26$.
- **Analysis:** Random Forest performed remarkably well without sequential boosting. Its parallel bagging mechanism and feature subsampling ($max\_features = 0.8$) prevented the ensemble from over-indexing on extreme outlier returns (negative sales). Its training time was higher (51.8s) due to constructing 100 deep trees without histogram binning.

### 3.4 LightGBM Regressor: Competitive Leaf-Wise Growth
- **Diagnostic Metrics:** Train WMAE of $\$1,158.55$, Val WMAE of $\$1,736.87$.
- **Analysis:** LightGBM converged quickly and performed competitively. However, with `regression_l1` objective and leaf-wise splitting up to 127 leaves, it exhibited slightly higher validation variance across holiday transitions compared to XGBoost's depth-wise quantile splitting.

### 3.5 XGBoost (Optuna Tuned): The Optimal Operating Frontier
- **Diagnostic Metrics:** Train WMAE of $\$882.24$, Val WMAE of **$\$1,616.78$**, Val RMSE of **$\$3,399.11$**, $R^2 = 0.9765$.
- **Analysis of Generalization Gap:** The generalization gap of $\$734.54$ is natural and expected in multi-entity time-series forecasting across 3,331 time series over an unseen 39-week future horizon. The model's validation loss remained strictly monotonic and stable without divergence across 1,000 boosting iterations.
- **Why It Won:**
  1. Second-order Taylor expansion of the weighted absolute loss allowed exact Hessian-guided tree pruning.
  2. The hyperparameter optimization correctly discovered a high `min_child_weight` (12) combined with L1 leaf regularization (`reg_alpha = 0.4018`) and feature subsampling (`colsample_bytree = 0.7082`), effectively preventing the model from memorizing historical noise while capturing the steep holiday peaks.

---

## 4. Key Feature Importance Analysis

From the trained optimal XGBoost model (visualized in Panel 4 of `training_curves.png`), the top predictive drivers of weekly sales are:

1. **`dw_median` (Dept-Week Historical Median):** Single strongest predictor (~32% gain). Directly encapsulates the department-specific annual seasonality curve.
2. **`sd_mean` & `sd_median` (Store-Dept Historical Baseline):** Captures individual store-department base scale (~28% gain).
3. **`Size` (Store Physical Square Footage):** Captures physical customer throughput capacity (~12% gain).
4. **`dept_mean` & `dept_median`:** Governs cold-start department baselines (~8% gain).
5. **`Is_Thanksgiving` & `Is_PreChristmas`:** Critical flags driving holiday volume surges (~7% gain).
6. **Macroeconomic Variables (`CPI`, `Fuel_Price`, `Unemployment`):** Contribute marginal gain individually (< 3%), but provide long-term macro trend adjustments.

---

## 5. Visualizations & Artifacts Summary

The visual proof generated during Phase 6 is saved at:
- **`training_curves.png`**:
  - **Panel 1:** Iteration vs. Training and Validation Weighted MAE curves confirming convergence.
  - **Panel 2:** Bar chart comparing validation WMAE across all candidate models.
  - **Panel 3:** Residual error distribution centered at zero ($\mu_{\text{residual}} \approx \$0$, near-Gaussian distribution with heavy symmetric tails).
  - **Panel 4:** Normalized feature gain rankings.
- **`model_comparison.csv`**: Full numerical metric table.
- **`submission.csv`**: 115,064 out-of-sample predictions generated on the untouched test partition.
