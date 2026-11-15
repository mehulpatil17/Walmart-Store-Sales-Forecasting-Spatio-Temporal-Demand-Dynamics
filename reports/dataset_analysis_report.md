# Comprehensive Dataset Analysis & Overfitting Risk Assessment Report
**Project:** Walmart Weekly Sales Forecasting by Store and Department  
**Dataset:** Walmart Recruiting - Store Sales Forecasting (Kaggle)  
**Author:** Senior Machine Learning Engineer, Data Scientist & ML Researcher  
**Date:** October 2026  
**Dataset Path:** `c:\Users\MEHUL\OneDrive\Documents\study\ML\project 3\data`

---

## Executive Summary

This report delivers a rigorous, data-driven audit of the Walmart Store Sales Forecasting dataset. The objective is to forecast department-level weekly sales (`Weekly_Sales`) across 45 stores comprising 81 distinct departments, evaluated using the competition-standard **Weighted Mean Absolute Error (WMAE)** where holiday weeks receive a $5\times$ penalty weight.

The analysis is based on full empirical scanning of all primary data partitions (`train.csv`, `test.csv`, `features.csv`, and `stores.csv`). Every architectural recommendation and hyperparameter boundary presented in subsequent phases is grounded in the empirical findings detailed below.

---

## Phase 1: Complete Dataset Analysis

### 1. Dataset Dimensions & Sample Inventory

| Table Partition | Row Count | Column Count | Primary Key / Index Components | Memory Footprint (Disk) |
|---|---|---|---|---|
| `train.csv` | 421,570 | 5 | `Store`, `Dept`, `Date` | 12.84 MB |
| `test.csv` | 115,064 | 4 | `Store`, `Dept`, `Date` | 2.60 MB |
| `features.csv` | 8,190 | 12 | `Store`, `Date` | 592 KB |
| `stores.csv` | 45 | 3 | `Store` | 532 B |
| **Combined Train Space** | **421,570** | **16 (merged)** | `Store`, `Dept`, `Date` | **~45 MB (in-memory)** |
| **Combined Test Space** | **115,064** | **15 (merged)** | `Store`, `Dept`, `Date` | **~12 MB (in-memory)** |

- **Total Historical Observations:** 536,634 combined store-department-week records.
- **Unique Stores:** 45 stores.
- **Unique Departments:** 81 departments.
- **Unique Time Series (Store $\times$ Dept):**
  - In Training set: 3,331 unique series.
  - In Test set: 3,169 unique series.
  - **Cold-Start Series (Test series unseen in Train):** 11 pairs (accounting for 36 test rows):
    - `(5, 99)`, `(9, 99)`, `(10, 99)`, `(18, 43)`, `(24, 43)`, `(25, 99)`, `(34, 39)`, `(36, 30)`, `(37, 29)`, `(42, 30)`, `(45, 39)`.
    - *Implication:* Models must feature hierarchical fallback representations (department-level and store-level aggregations) so cold-start series do not produce NaN or unconstrained predictions.

---

### 2. Temporal Structure & Partitions

The dataset represents weekly aggregated retail point-of-sale data with a strict 7-day interval ($168 \text{ hours}$):

```
+------------------------------------------------------------------------------------------------------+
|                                          CHRONOLOGICAL TIMELINE                                      |
+------------------------------------------------------------------------------------------------------+
| 2010-02-05                                           2012-10-26 | 2012-11-02              2013-07-26 |
| [==================== TRAIN SET ===============================] | [========= TEST SET =============] |
| 143 Weeks (421,570 records)                                      | 39 Weeks (115,064 records)         |
+------------------------------------------------------------------------------------------------------+
```

- **Train Temporal Span:** 2010-02-05 to 2012-10-26 (143 weeks / ~33 months).
- **Test Temporal Span:** 2012-11-02 to 2013-07-26 (39 weeks / ~9 months).
- **Sampling Interval:** Uniform 7 days ($\Delta t = 7 \text{ days}$).
- **Gap Between Train and Test:** Exactly 7 days (contiguous transition; no gap).
- **Partition Ratio:** Train represents 78.55% of the total temporal duration; Test represents 21.45%.

---

### 3. Target Variable Characterization: `Weekly_Sales`

- **Task Type:** Continuous Multi-Series Regression.
- **Evaluation Metric:** Weighted Mean Absolute Error (WMAE):
  $$\text{WMAE} = \frac{\sum_{i=1}^n w_i |y_i - \hat{y}_i|}{\sum_{i=1}^n w_i}, \quad w_i = \begin{cases} 5 & \text{if } \text{IsHoliday}_i = \text{True} \\ 1 & \text{if } \text{IsHoliday}_i = \text{False} \end{cases}$$

#### Target Descriptive Statistics

| Statistic | Value ($) | Analysis & Implication |
|---|---|---|
| **Count** | 421,570 | Complete; zero missing labels in training set. |
| **Mean** | 15,981.26 | Heavily skewed right compared to the median. |
| **Std Dev** | 22,711.18 | Extreme dispersion ($CV = \sigma / \mu = 1.42$). |
| **Min** | -4,988.94 | 1,285 records (0.305%) are negative (returns/refunds). |
| **1st Percentile** | 5.00 | Very small base sales in low-volume departments. |
| **5th Percentile** | 59.97 | Low activity tail. |
| **25th Percentile (Q1)** | 2,079.65 | Interquartile floor. |
| **50th Percentile (Median)**| 7,612.03 | Robust center of the distribution ($< 50\%$ of mean). |
| **75th Percentile (Q3)** | 20,205.85 | Interquartile ceiling ($IQR = \$18,126.20$). |
| **90th Percentile** | 42,845.67 | Upper 10% threshold. |
| **95th Percentile** | 61,201.95 | High-volume stores and departments. |
| **99th Percentile** | 106,479.59 | Extreme peak sales (holiday surges, electronics). |
| **Max** | 693,099.36 | Outlier holiday peak (Store 10, Dept 72 Thanksgiving). |
| **Skewness** | **+3.2620** | Strong positive skewness; heavy right tail. |
| **Kurtosis** | **+21.4913** | Extreme leptokurtosis; high frequency of outlier peaks. |
| **Zero Values** | 73 (0.017%) | Negligible zero-inflation. |
| **Negative Values** | 1,285 (0.305%) | Represents customer returns, markdowns, or accounting adjustments. Concentrated in Dept 47 (254 rows), Dept 18 (180 rows), Dept 54 (146 rows). |

---

### 4. Categorical Hierarchy & Store Topology

Walmart categorizes physical stores into three distinct store types based on size and operational model:

| Store Type | Store Count | Train Record Count (% share) | Mean Weekly Sales ($) | Median Weekly Sales ($) | Sales Std Dev ($) | Total Revenue Share (%) |
|---|---|---|---|---|---|---|
| **Type A** | 22 | 215,478 (51.1%) | 20,099.57 | 10,105.17 | 26,423.46 | $4.33 \text{ Billion}$ (64.3%) |
| **Type B** | 17 | 163,495 (38.8%) | 12,237.08 | 6,187.87 | 17,203.67 | $2.00 \text{ Billion}$ (29.7%) |
| **Type C** | 6 | 42,597 (10.1%) | 9,519.53 | 1,149.67 | 15,985.35 | $0.41 \text{ Billion}$ (6.0%) |

- **Physical Store Size:** Ranging from 34,875 sq. ft. to 219,622 sq. ft. (Mean: 130,287.6, Median: 126,512).
- **Correlation with Target:** Store `Size` exhibits a strong positive correlation ($r = +0.2438$) with `Weekly_Sales`.
- **Top 5 Revenue Departments:** Dept 92 ($483.9M), Dept 95 ($449.3M), Dept 38 ($393.1M), Dept 72 ($305.7M), Dept 90 ($291.1M).
- **Bottom Department:** Dept 47 (Total cumulative sales: $-\$4,962.93$).

---

### 5. Holiday Distribution & Seasonality Anatomy

Walmart explicitly flags 4 annual promotional holidays via the `IsHoliday` boolean column:

| Holiday Event | ISO Calendar Week | 2010 Date | 2011 Date | 2012 Date | 2013 Date | Partition Presence |
|---|---|---|---|---|---|---|
| **Super Bowl** | Week 6 | 2010-02-12 | 2011-02-11 | 2012-02-10 | 2013-02-08 | Train (3x), Test (1x) |
| **Labor Day** | Week 36 | 2010-09-10 | 2011-09-09 | 2012-09-07 | 2013-09-06 (past test) | Train (3x), Test (0x) |
| **Thanksgiving** | Week 47 | 2010-11-26 | 2011-11-25 | 2012-11-23 | 2013-11-29 (past test) | Train (2x), Test (1x) |
| **Christmas** | Week 52 | 2010-12-31 | 2011-12-30 | 2012-12-28 | 2013-12-27 (past test) | Train (2x), Test (1x) |

#### Critical Seasonality Nuance
- **Train IsHoliday Proportions:** 29,661 holiday rows (7.04%) vs 391,909 non-holiday rows (92.96%).
- **Test IsHoliday Proportions:** 8,928 holiday rows (7.76%) vs 106,136 non-holiday rows (92.24%).
- **The Pre-Christmas Anomaly:** Analysis of annual weekly totals reveals that **ISO Week 51 (the week immediately prior to Christmas)** is the highest revenue week of the entire year ($80.9M in 2010, $77.0M in 2011), exceeding Thanksgiving Week 47 ($65.8M and $66.6M). Crucially, **Week 51 is marked as `IsHoliday = False`** in the dataset. Models that rely solely on `IsHoliday` without ISO week-of-year features will completely fail to anticipate the year's single largest sales spike!

---

### 6. Missing Values, Duplicates & Data Quality Audit

| Column Name | Missing Count (Train) | Missing Count (Test) | Total Missing | Root Cause & Imputation Strategy |
|---|---|---|---|---|
| `Store`, `Dept`, `Date`, `Weekly_Sales`, `IsHoliday` | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | Completely clean. |
| `Type`, `Size` | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | Completely clean store metadata. |
| `Temperature`, `Fuel_Price` | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | Completely observed. |
| `MarkDown1` | 270,889 (64.3%) | 149 (0.13%) | 271,038 | Markdown program started in Nov 2011. Impute 0.0 + add `Has_MarkDown` flag. |
| `MarkDown2` | 310,322 (73.6%) | 28,627 (24.9%) | 338,949 | Markdown program started in Nov 2011. Impute 0.0. |
| `MarkDown3` | 284,479 (67.5%) | 9,829 (8.5%) | 294,308 | Markdown program started in Nov 2011. Impute 0.0. |
| `MarkDown4` | 286,603 (68.0%) | 12,888 (11.2%) | 299,491 | Markdown program started in Nov 2011. Impute 0.0. |
| `MarkDown5` | 270,138 (64.1%) | 0 (0.0%) | 270,138 | Markdown program started in Nov 2011. Impute 0.0. |
| **`CPI`** | **0 (0.0%)** | **38,162 (33.2%)** | **38,162** | **Critical Test Defect:** CPI ceases after 2013-04-26 (last 13 test weeks missing across all 45 stores). Forward-fill per store. |
| **`Unemployment`** | **0 (0.0%)** | **38,162 (33.2%)** | **38,162** | **Critical Test Defect:** Ceases after 2013-04-26. Forward-fill per store. |

- **Duplicate Records Check:**
  - `train.csv` duplicated `(Store, Dept, Date)`: Exactly 0 duplicates.
  - `test.csv` duplicated `(Store, Dept, Date)`: Exactly 0 duplicates.
  - `features.csv` duplicated `(Store, Date)`: Exactly 0 duplicates.
  - `stores.csv` duplicated `Store`: Exactly 0 duplicates.

---

### 7. Feature Correlations with Target (`Weekly_Sales`)

| Feature | Pearson Correlation ($r$) | Non-Linearity / Behavioural Notes |
|---|---|---|
| `Size` | **+0.2438** | Linear relationship; larger stores drive higher department throughput. |
| `MarkDown5` | +0.0904 | Moderate positive promotional pull. |
| `MarkDown1` | +0.0853 | Moderate positive promotional pull. |
| `MarkDown3` | +0.0604 | Heavily active during Thanksgiving/Christmas. |
| `MarkDown4` | +0.0454 | Secondary promotional effect. |
| `MarkDown2` | +0.0241 | Post-holiday clearance effect. |
| `Fuel_Price` | -0.0001 | Negligible linear correlation. |
| `Temperature` | -0.0023 | Negligible linear correlation, but seasonal proxy. |
| `CPI` | -0.0209 | Macro trend proxy. |
| `Unemployment` | -0.0259 | Macro economic indicator. |

---

## Phase 2: Identification of Overfitting and Underfitting Risks

### Risk Matrix & Diagnostic Assessment

| Risk Dimension | Risk Level | Empirical Evidence & Root Cause | Mitigation Strategy |
|---|---|---|---|
| **Sample Size vs Capacity** | **Low-to-Moderate** | 421,570 training records is a solid tabular dataset. It easily supports boosted trees ($10^2$ to $10^3$ estimators) but is vulnerable to over-parameterized deep neural networks. | Use constrained tree depth (depth 6–10) or strong leaf regularization (`num_leaves` 63–127). |
| **High Model Complexity (Overfitting)** | **High Risk** | If tree models split deeply on arbitrary noise in store-department identifiers or weather variables, training error collapses to near zero while validation WMAE diverges severely. | Apply L1/L2 leaf regularization (`reg_alpha`, `reg_lambda`), feature subsampling (`colsample_bytree = 0.85`), and minimum child weight constraints. |
| **Model Underfitting (High Bias)** | **High Risk for Linear Models** | Linear models cannot capture the severe multiplicative interactions between Store Type, Department, and specific calendar weeks (e.g. Dept 72 surging $30\times$ in Week 47). | Introduce hierarchical historical target encodings (`sd_median`, `dept_week_median`) and non-linear tree-based ensembles. |
| **Covariate Shift (MarkDowns)** | **Very High Risk** | MarkDowns 1–5 are 100% missing in 2010 and 85% missing in 2011, but present in 2012–2013. A model over-relying on markdowns will fail on periods lacking markdowns. | Provide `Total_MarkDown` and `Has_MarkDown` indicator features; ensure tree splits do not place disproportionate importance on markdowns. |
| **Lookahead / Data Leakage** | **Critical Risk** | Applying standard K-Fold cross validation shuffles future dates into the past, causing severe target leakage. Imputing CPI or computing rolling means across the full dataset causes forward leakage. | Implement strict chronological out-of-time (OOT) holdout validation. Compute target encodings and imputations strictly inside training folds. |
| **Metric-Loss Alignment** | **High Risk** | Standard MSE loss penalizes all samples quadratically, whereas the competition evaluation metric is WMAE ($5\times$ holiday weight, L1 norm). MSE models will underperform WMAE. | Use L1/MAE objective (`regression_l1` / `reg:absoluteerror`) paired with sample weighting ($w_i=5$ for holidays, $1$ otherwise). |

---

## Conclusion of Dataset Analysis

The dataset is a classic multi-entity hierarchical time-series forecasting problem with high categorical cardinality (3,331 series), extreme seasonal spikes, structural missingness (Markdowns and tail CPI/Unemployment), and an asymmetric evaluation metric (WMAE). Tree-based gradient boosting models with target encodings and calendar features represent the mathematically and empirically optimal candidate class.
