# Final Model Recommendation & Production Deployment Specification
**Project:** Walmart Weekly Sales Forecasting by Store and Department  
**Dataset:** Walmart Recruiting - Store Sales Forecasting (Kaggle)  
**Author:** Senior Machine Learning Engineer, Data Scientist & ML Researcher  
**Date:** October 2026  
**Recommended Model:** **Tuned Extreme Gradient Boosting Regressor (XGBoost)**  
**Checkpoint Path:** `c:\Users\MEHUL\OneDrive\Documents\study\ML\project 3\models\xgboost_model.joblib`  
**Test Predictions:** `c:\Users\MEHUL\OneDrive\Documents\study\ML\project 3\submission.csv`

---

## Executive Recommendation

Following rigorous exploratory data analysis, leak-free chronological partitioning, multi-model benchmarking, and systematic hyperparameter tuning, the **Tuned XGBoost Regressor (`objective='reg:absoluteerror'`)** is selected as the optimal production architecture for Walmart Store Sales Forecasting.

### Summary Scorecard

| Evaluation Dimension | Metric / Assessment | Evidence & Operational Impact |
|---|---|---|
| **Validation Performance** | **WMAE: \$1,616.78** | **Best in Benchmark:** Outperformed baseline by $\$806.84$ (-33.3% error) and Random Forest by $\$113.26$ (-6.5% error). |
| **Variance Explained** | **$R^2 = 0.9765$** | Captures 97.65% of the total variance in weekly retail sales across 3,331 distinct store-department time series. |
| **Root Mean Squared Error** | **RMSE: \$3,399.11** | Lowest RMSE among all candidates, demonstrating superior resilience against extreme holiday outlier spikes. |
| **Training Efficiency** | **16.75 seconds** | Full training on 305,982 records takes under 17 seconds on CPU; enables fast daily or weekly retraining pipelines. |
| **Inference Throughput** | **~245,000 samples/sec** | Scoring all 115,064 test records takes **0.47 seconds** (4.08 microseconds per prediction). |
| **Storage & Memory Footprint** | **21.7 MB (Disk)** | Lightweight joblib artifact; fits easily in microservice containers and edge deployment environments. |
| **Hardware Dependency** | **Pure CPU (No GPU required)** | Zero GPU overhead or CUDA runtime dependencies. |

---

## 1. Justification Against Alternative Candidates

No machine learning model is guaranteed to avoid overfitting or underfitting. Rather, model selection requires choosing the architecture that achieves the **best empirical trade-off between capacity, inductive bias, and regularization** for the specific data geometry:

1. **Why not Ridge Regression?**
   - *Empirical Result:* Val WMAE of $\$2,506.24$ ($R^2 = 0.9577$).
   - *Failure Mode:* Severe underfitting (high structural bias). Linear models cannot learn the multiplicative holiday interaction coefficients across departments without combinatorial feature explosion.
2. **Why not Random Forest?**
   - *Empirical Result:* Val WMAE of $\$1,730.04$ ($R^2 = 0.9747$).
   - *Assessment:* Robust, well-regularized ensemble. However, training time was $3.1\times$ slower (51.8s) than XGBoost, and validation error was $\$113.26$ higher due to lack of sequential residual gradient refinement.
3. **Why Tuned XGBoost?**
   - *Empirical Result:* Val WMAE of $\$1,616.78$ ($R^2 = 0.9765$).
   - *Assessment:* Sequential boosting with second-order Taylor expansion (gradients and Hessians) with tree leaf regularization (`reg_alpha` and `reg_lambda`) yields superior predictive accuracy and outlier resilience.

---

## 2. Exact Optimal Model Configuration

The exact parameter configuration that yielded the winning validation result is detailed below:

```python
import xgboost as xgb

final_model = xgb.XGBRegressor(
    objective='reg:absoluteerror',
    eval_metric='mae',
    n_estimators=1000,
    learning_rate=0.06958385771506816,
    max_depth=10,
    min_child_weight=12,
    subsample=0.8741033855094635,
    colsample_bytree=0.7081655260410183,
    reg_alpha=0.40184620434662083,
    reg_lambda=1.8719620948401228,
    random_state=42,
    n_jobs=-1,
    early_stopping_rounds=40
)
```

### Preprocessing & Training Protocol
- **Sample Weights:** $w_i = 5.0$ if `IsHoliday == 1`, else $w_i = 1.0$.
- **Macroeconomic Imputation:** Per-store chronological forward fill followed by training set median fallback.
- **Historical Group Medians:** Fitted strictly on training folds with 3-tier fallback for unseen series:
  $$\text{SD\_Median} \xrightarrow{\text{fallback}} \text{Dept\_Median} \xrightarrow{\text{fallback}} \text{Global\_Median}$$
- **Calendar Surge Features:** ISO Week, Month, Day, Year, and specific binary retail surge flags (`Is_SuperBowl`, `Is_LaborDay`, `Is_Thanksgiving`, `Is_PreChristmas`, `Is_Christmas`).

---

## 3. Production Deployment & Monitoring Architecture

```
+---------------------+     +--------------------------+     +--------------------------+
|  Raw Retail Feeds   |     | Preprocessing & Features |     |  Tuned XGBoost Engine    |
| - Stores Metadata   | --> | - Macro Imputation (ffill)| --> | - Checkpoint: .joblib    |
| - Weekly Features   |     | - Calendar Flags (W47/51)|     | - WMAE-Optimized Splits  |
| - POS Transactions  |     | - Target Encodings (Tr)  |     | - Latency: 4.08 µs/pred  |
+---------------------+     +--------------------------+     +--------------------------+
                                                                          |
                                                                          v
                                                             +--------------------------+
                                                             |   Downstream Systems     |
                                                             | - Supply Chain Inventory |
                                                             | - Staffing Schedules     |
                                                             | - Financial Forecasts    |
                                                             +--------------------------+
```

### Operational Guardrails & Maintenance Checklist
1. **Covariate Shift in Markdowns:**
   - MarkDown features were unrecorded prior to November 2011. In production, if markdown programs change or are discontinued, the binary `Has_MarkDown` and `Total_MarkDown` indicators buffer the model against sudden feature disappearance.
2. **Macroeconomic Indicator Lag:**
   - As observed in the test partition (where `CPI` and `Unemployment` are missing for the final 13 weeks), official government economic statistics often publish with a multi-month lag. The production pipeline must maintain a persistent per-store forward-fill cache.
3. **Model Drift & Retraining Schedule:**
   - The model should be retrained on an **expanding window** every 4 weeks as new weekly point-of-sale data settles.
   - If rolling 4-week WMAE exceeds $\$1,950$ (a $20\%$ degradation from the validation baseline of $\$1,616$), an automated alert must trigger hyperparameter recalibration.
4. **Cold-Start Monitoring:**
   - For newly opened stores or newly launched departments (similar to the 11 cold-start pairs identified in the test set), verify that the hierarchical fallback pipeline routes inference to department-type medians rather than outputting null values.
