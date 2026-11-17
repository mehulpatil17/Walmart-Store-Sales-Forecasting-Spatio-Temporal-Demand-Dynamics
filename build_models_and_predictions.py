"""
Execution script for Phase 3, 4, and 5:
- Fits Baseline 1 (Store-Dept Median), Baseline 2 (Lag-1), Baseline 3 (Lag-52)
- Trains Model 1 (Ridge Regression) and Model 2 (Random Forest)
- Generates holdout predictions across the 39-week validation period
- Computes comprehensive overall and holiday-specific error metrics
- Serializes checkpoints and prediction tables
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

def calculate_wmae(y_true, y_pred, is_holiday):
    weights = np.where(is_holiday == 1, 5.0, 1.0)
    return float(np.sum(weights * np.abs(y_true - y_pred)) / np.sum(weights))

def compute_metrics(y_true, y_pred, is_holiday):
    wmae = calculate_wmae(y_true, y_pred, is_holiday)
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    return {"WMAE": wmae, "MAE": mae, "RMSE": rmse, "R2": r2}

print("=== EXECUTING PHASES 3, 4, 5 ===")
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
stores = pd.read_csv(os.path.join(data_dir, "stores.csv"))
features_path = os.path.join(data_dir, "features.csv", "features.csv") if os.path.isdir(os.path.join(data_dir, "features.csv")) else os.path.join(data_dir, "features.csv")
train_path = os.path.join(data_dir, "train.csv", "train.csv") if os.path.isdir(os.path.join(data_dir, "train.csv")) else os.path.join(data_dir, "train.csv")
features = pd.read_csv(features_path)
train = pd.read_csv(train_path)

# Preprocessing
features_clean = features.copy()
features_clean['Date'] = pd.to_datetime(features_clean['Date'])
features_clean = features_clean.sort_values(['Store', 'Date'])
features_clean['CPI'] = features_clean.groupby('Store')['CPI'].ffill().fillna(features_clean['CPI'].median())
features_clean['Unemployment'] = features_clean.groupby('Store')['Unemployment'].ffill().fillna(features_clean['Unemployment'].median())

md_cols = ['MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5']
for c in md_cols:
    features_clean[c] = features_clean[c].fillna(0.0)
features_clean['Total_MarkDown'] = features_clean[md_cols].sum(axis=1)
features_clean['Has_MarkDown'] = (features_clean['Total_MarkDown'] > 0).astype(int)

train_m = train.copy()
train_m['Date'] = pd.to_datetime(train_m['Date'])
train_m = train_m.merge(stores, on='Store', how='left').merge(features_clean, on=['Store', 'Date', 'IsHoliday'], how='left')

train_m['Year'] = train_m['Date'].dt.year
train_m['Month'] = train_m['Date'].dt.month
train_m['Week'] = train_m['Date'].dt.isocalendar().week.astype(int)
train_m['Day'] = train_m['Date'].dt.day
train_m['IsHoliday'] = train_m['IsHoliday'].astype(int)
train_m['Type'] = train_m['Type'].map({'A': 1, 'B': 2, 'C': 3})

# Surge weeks
train_m['Is_SuperBowl'] = (train_m['Week'] == 6).astype(int)
train_m['Is_LaborDay'] = (train_m['Week'] == 36).astype(int)
train_m['Is_Thanksgiving'] = (train_m['Week'] == 47).astype(int)
train_m['Is_PreChristmas'] = (train_m['Week'] == 51).astype(int)
train_m['Is_Christmas'] = (train_m['Week'] == 52).astype(int)

# Create 52-week lag and 1-week lag for baselines
train_sorted = train_m.sort_values(['Store', 'Dept', 'Date']).copy()
train_sorted['Date_Lag1'] = train_sorted['Date'] - pd.Timedelta(days=7)
train_sorted['Date_Lag52'] = train_sorted['Date'] - pd.Timedelta(days=364)

# Self-join for true lag values
lag1_lookup = train[['Store', 'Dept', 'Date', 'Weekly_Sales']].copy()
lag1_lookup['Date'] = pd.to_datetime(lag1_lookup['Date'])
lag1_lookup = lag1_lookup.rename(columns={'Date': 'Date_Lag1', 'Weekly_Sales': 'Sales_Lag1'})

lag52_lookup = train[['Store', 'Dept', 'Date', 'Weekly_Sales']].copy()
lag52_lookup['Date'] = pd.to_datetime(lag52_lookup['Date'])
lag52_lookup = lag52_lookup.rename(columns={'Date': 'Date_Lag52', 'Weekly_Sales': 'Sales_Lag52'})

train_m = train_m.merge(lag1_lookup, on=['Store', 'Dept', 'Date_Lag1'], how='left') if 'Date_Lag1' in train_m else train_m
# Better yet, compute lags directly per group:
train_m = train_m.sort_values(['Store', 'Dept', 'Date'])
train_m['Sales_Lag1'] = train_m.groupby(['Store', 'Dept'])['Weekly_Sales'].shift(1)

# For Lag-52: join by (Store, Dept) with date - 52 weeks
train_m['Date_Minus_52W'] = train_m['Date'] - pd.to_timedelta(52*7, unit='d')
lag52_df = train_m[['Store', 'Dept', 'Date', 'Weekly_Sales']].copy().rename(columns={'Date': 'Date_Minus_52W', 'Weekly_Sales': 'Sales_Lag52'})
train_m = train_m.merge(lag52_df, on=['Store', 'Dept', 'Date_Minus_52W'], how='left')

# Chronological split
val_cutoff = pd.to_datetime('2012-02-03')
tr = train_m[train_m['Date'] < val_cutoff].copy()
va = train_m[train_m['Date'] >= val_cutoff].copy()

# Target encodings fitted strictly on tr
dept_stats = tr.groupby('Dept')['Weekly_Sales'].agg(dept_mean='mean', dept_median='median', dept_std='std').reset_index()
dept_stats['dept_std'] = dept_stats['dept_std'].fillna(0.0)
store_stats = tr.groupby('Store')['Weekly_Sales'].agg(store_mean='mean', store_median='median').reset_index()
sd_stats = tr.groupby(['Store', 'Dept'])['Weekly_Sales'].agg(sd_mean='mean', sd_median='median', sd_std='std').reset_index()
sd_stats['sd_std'] = sd_stats['sd_std'].fillna(0.0)
dw_stats = tr.groupby(['Dept', 'Week'])['Weekly_Sales'].agg(dw_median='median').reset_index()

global_mean = float(tr['Weekly_Sales'].mean())
global_median = float(tr['Weekly_Sales'].median())

def apply_encodings(df):
    out = df.merge(dept_stats, on='Dept', how='left')
    out = out.merge(store_stats, on='Store', how='left')
    out = out.merge(sd_stats, on=['Store', 'Dept'], how='left')
    out = out.merge(dw_stats, on=['Dept', 'Week'], how='left')
    out['dept_mean'] = out['dept_mean'].fillna(global_mean)
    out['dept_median'] = out['dept_median'].fillna(global_median)
    out['dept_std'] = out['dept_std'].fillna(0.0)
    out['store_mean'] = out['store_mean'].fillna(global_mean)
    out['store_median'] = out['store_median'].fillna(global_median)
    out['sd_mean'] = out['sd_mean'].fillna(out['dept_mean'])
    out['sd_median'] = out['sd_median'].fillna(out['dept_median'])
    out['sd_std'] = out['sd_std'].fillna(out['dept_std'])
    out['dw_median'] = out['dw_median'].fillna(out['dept_median'])
    return out

tr = apply_encodings(tr)
va = apply_encodings(va)

# Fill missing lags on validation using fallback (sd_median)
va['Sales_Lag1'] = va['Sales_Lag1'].fillna(va['sd_median'])
va['Sales_Lag52'] = va['Sales_Lag52'].fillna(va['sd_median'])

feature_cols = [
    'Store', 'Dept', 'Type', 'Size',
    'Year', 'Month', 'Week', 'Day', 'IsHoliday',
    'Is_SuperBowl', 'Is_LaborDay', 'Is_Thanksgiving', 'Is_PreChristmas', 'Is_Christmas',
    'Temperature', 'Fuel_Price', 'CPI', 'Unemployment',
    'MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5', 'Total_MarkDown', 'Has_MarkDown',
    'dept_mean', 'dept_median', 'dept_std',
    'store_mean', 'store_median',
    'sd_mean', 'sd_median', 'sd_std',
    'dw_median'
]

X_tr = tr[feature_cols].copy()
y_tr = tr['Weekly_Sales'].values
h_tr = tr['IsHoliday'].values

X_va = va[feature_cols].copy()
y_va = va['Weekly_Sales'].values
h_va = va['IsHoliday'].values

weights_tr = np.where(h_tr == 1, 5.0, 1.0)
weights_va = np.where(h_va == 1, 5.0, 1.0)

os.makedirs("models", exist_ok=True)

# 1. BASELINE PREDICTIONS
va['Pred_Base_Median'] = va['sd_median'].values
va['Pred_Base_Lag1'] = va['Sales_Lag1'].values
va['Pred_Base_Lag52'] = va['Sales_Lag52'].values

# 2. MODEL 1: RIDGE REGRESSION
print("Training Model 1: Ridge Regression...")
ridge = Pipeline([
    ('scaler', StandardScaler()),
    ('model', Ridge(alpha=100.0, random_state=42))
])
ridge.fit(X_tr, y_tr)
joblib.dump(ridge, "models/ridge_model.joblib")
va['Pred_Ridge'] = ridge.predict(X_va)

# 3. MODEL 2: RANDOM FOREST REGRESSOR
print("Training Model 2: Random Forest Regressor...")
rf = RandomForestRegressor(
    n_estimators=100,
    max_depth=16,
    min_samples_split=10,
    min_samples_leaf=4,
    max_features=0.8,
    n_jobs=-1,
    random_state=42
)
rf.fit(X_tr, y_tr)
joblib.dump(rf, "models/rf_model.joblib")
va['Pred_RF'] = rf.predict(X_va)

# 4. REFERENCE OPTIMAL MODEL: TUNED XGBOOST
print("Loading / Training Tuned XGBoost...")
xgb_params = {
    'objective': 'reg:absoluteerror',
    'eval_metric': 'mae',
    'n_estimators': 1000,
    'learning_rate': 0.06958,
    'max_depth': 10,
    'min_child_weight': 12,
    'subsample': 0.8741,
    'colsample_bytree': 0.7082,
    'reg_alpha': 0.4018,
    'reg_lambda': 1.8720,
    'random_state': 42,
    'n_jobs': -1,
    'early_stopping_rounds': 40
}
xgb_model = xgb.XGBRegressor(**xgb_params)
xgb_model.fit(
    X_tr, y_tr,
    sample_weight=weights_tr,
    eval_set=[(X_va, y_va)],
    sample_weight_eval_set=[weights_va],
    verbose=False
)
joblib.dump(xgb_model, "models/xgboost_model.joblib")
va['Pred_XGB'] = xgb_model.predict(X_va)

# Compute metrics disaggregated by Overall, Holiday Weeks, Regular Weeks
methods = {
    "Baseline 1: Historical Median": "Pred_Base_Median",
    "Baseline 2: Last Week (Lag-1)": "Pred_Base_Lag1",
    "Baseline 3: Same Week Last Year (Lag-52)": "Pred_Base_Lag52",
    "Candidate 1: Ridge Regression": "Pred_Ridge",
    "Candidate 2: Random Forest": "Pred_RF",
    "Optimal Benchmark: XGBoost": "Pred_XGB"
}

is_hol = (va['IsHoliday'] == 1).values
is_reg = (va['IsHoliday'] == 0).values

metrics_summary = {}

print("\n=== HOLDOUT EVALUATION SUMMARY (39 WEEKS) ===")
for name, col in methods.items():
    preds = va[col].values
    
    overall = compute_metrics(y_va, preds, h_va)
    holiday = compute_metrics(y_va[is_hol], preds[is_hol], h_va[is_hol])
    regular = compute_metrics(y_va[is_reg], preds[is_reg], h_va[is_reg])
    
    metrics_summary[name] = {
        "Overall": overall,
        "Holiday_Only": holiday,
        "Regular_Only": regular,
        "Holiday_Inflation_Ratio": holiday['MAE'] / (regular['MAE'] + 1e-6)
    }
    print(f"\n{name}:")
    print(f"  Overall:  WMAE=${overall['WMAE']:.2f} | MAE=${overall['MAE']:.2f} | RMSE=${overall['RMSE']:.2f} | R2={overall['R2']:.4f}")
    print(f"  Holiday:  MAE=${holiday['MAE']:.2f} | RMSE=${holiday['RMSE']:.2f}")
    print(f"  Regular:  MAE=${regular['MAE']:.2f} | RMSE=${regular['RMSE']:.2f}")
    print(f"  Holiday Error Ratio: {holiday['MAE'] / (regular['MAE'] + 1e-6):.2f}x")

with open("metrics_summary.json", "w") as f:
    json.dump(metrics_summary, f, indent=4)

# Save holdout predictions table
save_cols = [
    'Store', 'Dept', 'Date', 'Weekly_Sales', 'IsHoliday', 'Week', 'Year',
    'Pred_Base_Median', 'Pred_Base_Lag1', 'Pred_Base_Lag52',
    'Pred_Ridge', 'Pred_RF', 'Pred_XGB'
]
va_save = va[save_cols].copy()
va_save['Date'] = va_save['Date'].dt.strftime('%Y-%m-%d')
va_save.to_parquet("holdout_predictions.parquet", index=False)
print(f"\nSaved {len(va_save)} holdout predictions to holdout_predictions.parquet")

# Also save historical weekly actuals for model server & analysis
hist_save = tr[['Store', 'Dept', 'Date', 'Weekly_Sales', 'IsHoliday', 'Week', 'Year']].copy()
hist_save['Date'] = hist_save['Date'].dt.strftime('%Y-%m-%d')
hist_save.to_parquet("history_actuals.parquet", index=False)
print(f"Saved {len(hist_save)} historical training actuals to history_actuals.parquet")

print("Phases 3, 4, 5 complete!")
