"""
========================================================================================
Production Training Pipeline: Walmart Store Sales Forecasting
========================================================================================
Author: Senior Machine Learning Engineer, Data Scientist & ML Researcher
Date: October 2026
Objective: End-to-end reproducible, leakage-free forecasting pipeline with strict
           chronological validation, hierarchical target encoding, WMAE weighting,
           early stopping, model checkpointing, and test prediction generation.
========================================================================================
"""

import os
import sys
import time
import json
import logging
import argparse
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Tuple, List, Optional

import xgboost as xgb
import lightgbm as lgb
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("WalmartSalesPipeline")


# -----------------------------------------------------------------------------
# Metric Definitions
# -----------------------------------------------------------------------------

def calculate_wmae(y_true: np.ndarray, y_pred: np.ndarray, is_holiday: np.ndarray) -> float:
    """
    Compute competition-standard Weighted Mean Absolute Error (WMAE):
    Weight = 5.0 for holiday weeks, Weight = 1.0 for non-holiday weeks.
    """
    weights = np.where(is_holiday == 1, 5.0, 1.0)
    wmae = np.sum(weights * np.abs(y_true - y_pred)) / np.sum(weights)
    return float(wmae)


def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray, is_holiday: np.ndarray) -> Dict[str, float]:
    """
    Compute full evaluation metrics: WMAE, MAE, RMSE, and R2.
    """
    wmae = calculate_wmae(y_true, y_pred, is_holiday)
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    return {
        "WMAE": wmae,
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2
    }


# -----------------------------------------------------------------------------
# Data Ingestion & Leakage-Free Preprocessing
# -----------------------------------------------------------------------------

class WalmartDataPipeline:
    """
    Handles data ingestion, feature engineering, and leakage-free out-of-fold
    hierarchical target encodings.
    """
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.stores_path = os.path.join(data_dir, "stores.csv")
        self.features_path = os.path.join(data_dir, "features.csv", "features.csv") if os.path.isdir(os.path.join(data_dir, "features.csv")) else os.path.join(data_dir, "features.csv")
        self.train_path = os.path.join(data_dir, "train.csv", "train.csv") if os.path.isdir(os.path.join(data_dir, "train.csv")) else os.path.join(data_dir, "train.csv")
        self.test_path = os.path.join(data_dir, "test.csv", "test.csv") if os.path.isdir(os.path.join(data_dir, "test.csv")) else os.path.join(data_dir, "test.csv")
        
        self.dept_stats: Optional[pd.DataFrame] = None
        self.store_stats: Optional[pd.DataFrame] = None
        self.sd_stats: Optional[pd.DataFrame] = None
        self.dw_stats: Optional[pd.DataFrame] = None
        self.global_mean: float = 0.0
        self.global_median: float = 0.0
        
        self.feature_columns = [
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

    def load_raw_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        logger.info(f"Loading datasets from: {self.data_dir}")
        stores = pd.read_csv(self.stores_path)
        features = pd.read_csv(self.features_path)
        train = pd.read_csv(self.train_path)
        test = pd.read_csv(self.test_path)
        logger.info(f"Loaded: Stores {stores.shape}, Features {features.shape}, Train {train.shape}, Test {test.shape}")
        return train, test, stores, features

    def engineer_base_features(self, train: pd.DataFrame, test: pd.DataFrame, 
                               stores: pd.DataFrame, features: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        logger.info("Executing base feature engineering & macroeconomic imputation...")
        
        # Clean features: forward fill per store, median fallback
        feat_clean = features.copy()
        feat_clean['Date'] = pd.to_datetime(feat_clean['Date'])
        feat_clean = feat_clean.sort_values(['Store', 'Date'])
        feat_clean['CPI'] = feat_clean.groupby('Store')['CPI'].ffill().fillna(feat_clean['CPI'].median())
        feat_clean['Unemployment'] = feat_clean.groupby('Store')['Unemployment'].ffill().fillna(feat_clean['Unemployment'].median())
        
        # Markdowns
        md_cols = ['MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5']
        for c in md_cols:
            feat_clean[c] = feat_clean[c].fillna(0.0)
        feat_clean['Total_MarkDown'] = feat_clean[md_cols].sum(axis=1)
        feat_clean['Has_MarkDown'] = (feat_clean['Total_MarkDown'] > 0).astype(int)

        # Merge
        tr_merged = train.copy()
        te_merged = test.copy()
        tr_merged['Date'] = pd.to_datetime(tr_merged['Date'])
        te_merged['Date'] = pd.to_datetime(te_merged['Date'])

        tr_merged = tr_merged.merge(stores, on='Store', how='left').merge(feat_clean, on=['Store', 'Date', 'IsHoliday'], how='left')
        te_merged = te_merged.merge(stores, on='Store', how='left').merge(feat_clean, on=['Store', 'Date', 'IsHoliday'], how='left')

        for df in [tr_merged, te_merged]:
            df['Year'] = df['Date'].dt.year
            df['Month'] = df['Date'].dt.month
            df['Week'] = df['Date'].dt.isocalendar().week.astype(int)
            df['Day'] = df['Date'].dt.day
            df['IsHoliday'] = df['IsHoliday'].astype(int)
            df['Type'] = df['Type'].map({'A': 1, 'B': 2, 'C': 3})
            
            # Key retail surge calendar markers
            df['Is_SuperBowl'] = (df['Week'] == 6).astype(int)
            df['Is_LaborDay'] = (df['Week'] == 36).astype(int)
            df['Is_Thanksgiving'] = (df['Week'] == 47).astype(int)
            df['Is_PreChristmas'] = (df['Week'] == 51).astype(int)
            df['Is_Christmas'] = (df['Week'] == 52).astype(int)

        return tr_merged, te_merged

    def fit_target_encodings(self, train_split: pd.DataFrame):
        """
        Fit hierarchical aggregations strictly on the training partition.
        No validation or test labels are used.
        """
        logger.info(f"Fitting hierarchical target encodings on {len(train_split)} training observations...")
        self.global_mean = float(train_split['Weekly_Sales'].mean())
        self.global_median = float(train_split['Weekly_Sales'].median())

        self.dept_stats = train_split.groupby('Dept')['Weekly_Sales'].agg(
            dept_mean='mean', dept_median='median', dept_std='std'
        ).reset_index()
        self.dept_stats['dept_std'] = self.dept_stats['dept_std'].fillna(0.0)

        self.store_stats = train_split.groupby('Store')['Weekly_Sales'].agg(
            store_mean='mean', store_median='median'
        ).reset_index()

        self.sd_stats = train_split.groupby(['Store', 'Dept'])['Weekly_Sales'].agg(
            sd_mean='mean', sd_median='median', sd_std='std'
        ).reset_index()
        self.sd_stats['sd_std'] = self.sd_stats['sd_std'].fillna(0.0)

        self.dw_stats = train_split.groupby(['Dept', 'Week'])['Weekly_Sales'].agg(
            dw_median='median'
        ).reset_index()

    def transform_target_encodings(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply pre-computed aggregations with hierarchical fallbacks for unseen combinations.
        """
        out = df.merge(self.dept_stats, on='Dept', how='left')
        out = out.merge(self.store_stats, on='Store', how='left')
        out = out.merge(self.sd_stats, on=['Store', 'Dept'], how='left')
        out = out.merge(self.dw_stats, on=['Dept', 'Week'], how='left')

        # Fallbacks
        out['dept_mean'] = out['dept_mean'].fillna(self.global_mean)
        out['dept_median'] = out['dept_median'].fillna(self.global_median)
        out['dept_std'] = out['dept_std'].fillna(0.0)

        out['store_mean'] = out['store_mean'].fillna(self.global_mean)
        out['store_median'] = out['store_median'].fillna(self.global_median)

        out['sd_mean'] = out['sd_mean'].fillna(out['dept_mean'])
        out['sd_median'] = out['sd_median'].fillna(out['dept_median'])
        out['sd_std'] = out['sd_std'].fillna(out['dept_std'])

        out['dw_median'] = out['dw_median'].fillna(out['dept_median'])
        return out


# -----------------------------------------------------------------------------
# Model Pipeline & Training Execution
# -----------------------------------------------------------------------------

def build_model(model_name: str, params: Optional[Dict] = None):
    """
    Construct candidate model according to best practices and regularization.
    """
    if model_name == "ridge":
        alpha = params.get('alpha', 100.0) if params else 100.0
        return Pipeline([
            ('scaler', StandardScaler()),
            ('model', Ridge(alpha=alpha, random_state=42))
        ])
    
    elif model_name == "random_forest":
        p = params or {
            'n_estimators': 100,
            'max_depth': 16,
            'min_samples_split': 10,
            'min_samples_leaf': 4,
            'max_features': 0.8,
            'n_jobs': -1,
            'random_state': 42
        }
        return RandomForestRegressor(**p)

    elif model_name == "lightgbm":
        p = params or {
            'objective': 'regression_l1',
            'metric': 'mae',
            'boosting_type': 'gbdt',
            'n_estimators': 800,
            'learning_rate': 0.08,
            'num_leaves': 127,
            'subsample': 0.85,
            'colsample_bytree': 0.85,
            'reg_alpha': 0.1,
            'reg_lambda': 1.0,
            'random_state': 42,
            'n_jobs': -1,
            'verbose': -1
        }
        return lgb.LGBMRegressor(**p)

    elif model_name == "xgboost":
        p = params or {
            'objective': 'reg:absoluteerror',
            'eval_metric': 'mae',
            'n_estimators': 800,
            'learning_rate': 0.08,
            'max_depth': 8,
            'min_child_weight': 5,
            'subsample': 0.85,
            'colsample_bytree': 0.85,
            'reg_alpha': 0.25,
            'reg_lambda': 2.5,
            'random_state': 42,
            'n_jobs': -1,
            'early_stopping_rounds': 40
        }
        return xgb.XGBRegressor(**p)
    else:
        raise ValueError(f"Unsupported model: {model_name}")


def run_training_pipeline(data_dir: str, model_type: str = "xgboost", 
                          generate_submission: bool = True, output_dir: str = ".") -> Dict:
    """
    Main training execution function.
    """
    pipeline = WalmartDataPipeline(data_dir)
    train_df, test_df, stores_df, features_df = pipeline.load_raw_data()
    
    train_eng, test_eng = pipeline.engineer_base_features(train_df, test_df, stores_df, features_df)

    # Chronological Split: 104 Weeks Train, 39 Weeks Validation
    val_cutoff = pd.to_datetime("2012-02-03")
    tr_df = train_eng[train_eng['Date'] < val_cutoff].copy()
    va_df = train_eng[train_eng['Date'] >= val_cutoff].copy()
    
    logger.info(f"Chronological Split: Train ({len(tr_df)} rows, 104 weeks) | Val ({len(va_df)} rows, 39 weeks)")

    # Fit target encodings strictly on training fold
    pipeline.fit_target_encodings(tr_df)
    tr_df = pipeline.transform_target_encodings(tr_df)
    va_df = pipeline.transform_target_encodings(va_df)
    test_eng = pipeline.transform_target_encodings(test_eng)

    feature_cols = pipeline.feature_columns
    X_tr = tr_df[feature_cols].copy()
    y_tr = tr_df['Weekly_Sales'].values
    h_tr = tr_df['IsHoliday'].values

    X_va = va_df[feature_cols].copy()
    y_va = va_df['Weekly_Sales'].values
    h_va = va_df['IsHoliday'].values

    X_te = test_eng[feature_cols].copy()
    h_te = test_eng['IsHoliday'].values

    # Sample weights
    weights_tr = np.where(h_tr == 1, 5.0, 1.0)
    weights_va = np.where(h_va == 1, 5.0, 1.0)

    # 1. Baseline Evaluation
    logger.info("Evaluating Simple Heuristic Baseline (Historical Store-Dept Median)...")
    base_preds = va_df['sd_median'].values
    base_metrics = compute_regression_metrics(y_va, base_preds, h_va)
    logger.info(f"Baseline -> Val WMAE: ${base_metrics['WMAE']:.2f}, Val MAE: ${base_metrics['MAE']:.2f}")

    # 2. Candidate Model Training
    logger.info(f"Training Candidate Model: {model_type}...")
    t_start = time.time()
    
    if model_type == "xgboost":
        # Load best params if available
        params_file = os.path.join(output_dir, "best_tuned_params.json")
        xgb_params = {
            'objective': 'reg:absoluteerror',
            'eval_metric': 'mae',
            'n_estimators': 1000,
            'learning_rate': 0.08,
            'max_depth': 8,
            'min_child_weight': 5,
            'subsample': 0.85,
            'colsample_bytree': 0.85,
            'reg_alpha': 0.25,
            'reg_lambda': 2.5,
            'random_state': 42,
            'n_jobs': -1,
            'early_stopping_rounds': 40
        }
        if os.path.exists(params_file):
            try:
                with open(params_file, "r") as f:
                    saved = json.load(f)
                    if 'best_params' in saved:
                        xgb_params.update(saved['best_params'])
                        logger.info(f"Loaded tuned hyperparameters from {params_file}")
            except Exception as e:
                logger.warning(f"Could not load {params_file}: {e}")

        model = xgb.XGBRegressor(**xgb_params)
        model.fit(
            X_tr, y_tr,
            sample_weight=weights_tr,
            eval_set=[(X_tr, y_tr), (X_va, y_va)],
            sample_weight_eval_set=[weights_tr, weights_va],
            verbose=False
        )
        best_iter = int(model.best_iteration)
    elif model_type == "lightgbm":
        model = build_model("lightgbm")
        model.fit(
            X_tr, y_tr,
            sample_weight=weights_tr,
            eval_set=[(X_va, y_va)],
            eval_sample_weight=[weights_va],
            callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)]
        )
        best_iter = model.best_iteration_
    elif model_type == "random_forest":
        model = build_model("random_forest")
        model.fit(X_tr, y_tr)
        best_iter = None
    elif model_type == "ridge":
        model = build_model("ridge")
        model.fit(X_tr, y_tr)
        best_iter = None
    else:
        raise ValueError(f"Unknown model_type: {model_type}")

    fit_duration = time.time() - t_start
    logger.info(f"Model fitting complete in {fit_duration:.2f}s")

    # Evaluation
    pred_tr = model.predict(X_tr)
    pred_va = model.predict(X_va)

    metrics_tr = compute_regression_metrics(y_tr, pred_tr, h_tr)
    metrics_va = compute_regression_metrics(y_va, pred_va, h_va)
    gen_gap = metrics_va['WMAE'] - metrics_tr['WMAE']

    logger.info("=" * 60)
    logger.info(f"MODEL RESULTS: {model_type.upper()}")
    logger.info(f"Training   -> WMAE: ${metrics_tr['WMAE']:.2f} | MAE: ${metrics_tr['MAE']:.2f} | RMSE: ${metrics_tr['RMSE']:.2f} | R2: {metrics_tr['R2']:.4f}")
    logger.info(f"Validation -> WMAE: ${metrics_va['WMAE']:.2f} | MAE: ${metrics_va['MAE']:.2f} | RMSE: ${metrics_va['RMSE']:.2f} | R2: {metrics_va['R2']:.4f}")
    logger.info(f"Generalization Gap: ${gen_gap:.2f}")
    logger.info("=" * 60)

    # Save model checkpoint
    checkpoint_path = os.path.join(output_dir, f"best_{model_type}_checkpoint.joblib")
    joblib.dump(model, checkpoint_path)
    logger.info(f"Saved model checkpoint to: {checkpoint_path}")

    # Generate Test Predictions & Submission
    if generate_submission:
        logger.info("Generating predictions on untouched official test partition...")
        pred_test = model.predict(X_te)
        
        # Build Id string: Store_Dept_Date
        test_ids = test_eng['Store'].astype(str) + "_" + test_eng['Dept'].astype(str) + "_" + test_eng['Date'].dt.strftime('%Y-%m-%d')
        submission_df = pd.DataFrame({
            'Id': test_ids,
            'Weekly_Sales': pred_test
        })
        
        submission_path = os.path.join(output_dir, "submission.csv")
        submission_df.to_csv(submission_path, index=False)
        logger.info(f"Saved submission file to: {submission_path} ({len(submission_df)} rows)")

    return {
        "model_type": model_type,
        "metrics_train": metrics_tr,
        "metrics_val": metrics_va,
        "generalization_gap": gen_gap,
        "fit_duration_sec": fit_duration,
        "best_iteration": best_iter
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Walmart Sales Forecasting Production Training Pipeline")
    parser.add_argument("--data_dir", type=str, default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"),
                        help="Path to folder containing dataset csv files")
    parser.add_argument("--model", type=str, default="xgboost", choices=["xgboost", "lightgbm", "random_forest", "ridge"],
                        help="Candidate model architecture to train")
    parser.add_argument("--no_submission", action="store_true", help="Skip test submission generation")
    parser.add_argument("--output_dir", type=str, default=os.path.dirname(os.path.abspath(__file__)),
                        help="Output directory for checkpoints and submissions")
    args = parser.parse_args()

    run_training_pipeline(
        data_dir=args.data_dir,
        model_type=args.model,
        generate_submission=not args.no_submission,
        output_dir=args.output_dir
    )
