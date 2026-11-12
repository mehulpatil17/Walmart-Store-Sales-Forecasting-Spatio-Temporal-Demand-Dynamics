"""
========================================================================================
Streamlit Web Application: Walmart Store Sales Forecasting (ES 335)
========================================================================================
Interactive dashboard demonstrating:
- Store & Department selection across 45 stores and 81 departments
- Historical weekly sales trajectory with marked holiday periods
- Holdout actual vs. predicted comparison across baselines and candidate models
- Multi-metric scorecard (WMAE, MAE, RMSE) with holiday disaggregation
- Non-causal forecasting disclaimer and volatility diagnostics
========================================================================================
"""

import os
import json
import numpy as np
import pandas as pd
import streamlit as st
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Page configuration
st.set_page_config(
    page_title="Walmart Sales Forecasting | ES 335",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.1rem;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #4B5563;
        margin-bottom: 1.2rem;
    }
    .disclaimer-box {
        background-color: #FEF3C7;
        border-left: 5px solid #F59E0B;
        padding: 12px 16px;
        border-radius: 4px;
        color: #92400E;
        font-size: 0.92rem;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        padding: 14px;
        border-radius: 8px;
        text-align: center;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #6B7280;
        font-weight: 600;
        text-transform: uppercase;
    }
    .metric-val {
        font-size: 1.45rem;
        font-weight: 700;
        color: #111827;
    }
</style>
""", unsafe_allow_html=True)

# Helper function to compute metrics
def compute_metrics(y_true, y_pred, is_holiday):
    if len(y_true) == 0:
        return {"WMAE": 0.0, "MAE": 0.0, "RMSE": 0.0}
    weights = np.where(is_holiday == 1, 5.0, 1.0)
    wmae = np.sum(weights * np.abs(y_true - y_pred)) / np.sum(weights)
    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    return {"WMAE": float(wmae), "MAE": float(mae), "RMSE": float(rmse)}

@st.cache_data
def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    holdout_path = os.path.join(base_dir, "holdout_predictions.parquet")
    history_path = os.path.join(base_dir, "history_actuals.parquet")
    metrics_path = os.path.join(base_dir, "metrics_summary.json")
    stores_path = os.path.join(base_dir, "data", "stores.csv")

    df_holdout = pd.read_parquet(holdout_path) if os.path.exists(holdout_path) else None
    df_history = pd.read_parquet(history_path) if os.path.exists(history_path) else None
    df_stores = pd.read_csv(stores_path) if os.path.exists(stores_path) else None
    
    summary = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            summary = json.load(f)

    return df_holdout, df_history, df_stores, summary

df_holdout, df_history, df_stores, metrics_summary = load_data()

# Header Section
st.markdown('<div class="main-header">Walmart Store Sales Forecasting Dashboard</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Course: ES 335 | Machine Learning Term Project | Out-of-Time Chronological Evaluation</div>', unsafe_allow_html=True)

# Non-Causal Interpretability Banner (per prompt specification)
st.markdown("""
<div class="disclaimer-box">
    <b>Forecasting & Non-Causal Interpretability Note:</b><br>
    The forecasts produced by these models reflect statistical associations learned from recurring temporal and historical patterns. 
    They do <b>not</b> imply or prove that promotional markdowns or local macroeconomic factors (fuel price, CPI, unemployment) 
    <i>cause</i> weekly sales to fluctuate. Forecast variance and errors are significantly higher during high-volatility holiday weeks 
    (such as Thanksgiving and pre-Christmas), where retail shopping rushes produce sharp non-linear volume surges.
</div>
""", unsafe_allow_html=True)

if df_holdout is None or df_history is None:
    st.warning("Prediction artifacts are being generated. Please refresh in a few moments.")
    st.stop()

# -----------------------------------------------------------------------------
# Sidebar Navigation & Selection
# -----------------------------------------------------------------------------
st.sidebar.header("Navigation & Filters")

available_stores = sorted(df_holdout['Store'].unique())
selected_store = st.sidebar.selectbox("Select Physical Store:", available_stores, index=0)

# Store Metadata pill
if df_stores is not None:
    store_meta = df_stores[df_stores['Store'] == selected_store].iloc[0]
    st.sidebar.info(f"Store {selected_store} Details:\n- **Type:** {store_meta['Type']}\n- **Size:** {store_meta['Size']:,} sq. ft.")

# Departments available in selected store
available_depts = sorted(df_holdout[df_holdout['Store'] == selected_store]['Dept'].unique())
selected_dept = st.sidebar.selectbox("Select Department:", available_depts, index=0)

# Holiday filter toggle
filter_mode = st.sidebar.radio(
    "Evaluation Horizon Mode:",
    ["All Holdout Weeks (39 Weeks)", "Holiday Weeks Only", "Regular Weeks Only"],
    index=0
)

# Model Visibility Checkboxes
st.sidebar.markdown("---")
st.sidebar.subheader("Models to Display")
show_base_med = st.sidebar.checkbox("Baseline 1: Historical Median", value=True)
show_base_lag1 = st.sidebar.checkbox("Baseline 2: Last Week (Lag-1)", value=False)
show_base_lag52 = st.sidebar.checkbox("Baseline 3: Same Week Last Year", value=True)
show_ridge = st.sidebar.checkbox("Candidate 1: Ridge Regression", value=True)
show_rf = st.sidebar.checkbox("Candidate 2: Random Forest", value=True)
show_xgb = st.sidebar.checkbox("Optimal Benchmark: Tuned XGBoost", value=True)

# -----------------------------------------------------------------------------
# Data Slicing for Selected Store & Dept
# -----------------------------------------------------------------------------
hist_sub = df_history[(df_history['Store'] == selected_store) & (df_history['Dept'] == selected_dept)].copy()
hold_sub = df_holdout[(df_holdout['Store'] == selected_store) & (df_holdout['Dept'] == selected_dept)].copy()

hist_sub['Date'] = pd.to_datetime(hist_sub['Date'])
hold_sub['Date'] = pd.to_datetime(hold_sub['Date'])

hist_sub = hist_sub.sort_values('Date')
hold_sub = hold_sub.sort_values('Date')

# Filter for metrics calculation based on sidebar mode
if filter_mode == "Holiday Weeks Only":
    eval_sub = hold_sub[hold_sub['IsHoliday'] == 1].copy()
elif filter_mode == "Regular Weeks Only":
    eval_sub = hold_sub[hold_sub['IsHoliday'] == 0].copy()
else:
    eval_sub = hold_sub.copy()

# -----------------------------------------------------------------------------
# Metric Scorecard for Selected Store-Dept
# -----------------------------------------------------------------------------
st.subheader(f"Performance Scorecard: Store {selected_store}, Department {selected_dept} ({filter_mode})")

model_metrics = {}
if len(eval_sub) > 0:
    y_true = eval_sub['Weekly_Sales'].values
    h_arr = eval_sub['IsHoliday'].values
    
    candidate_map = {
        "Baseline Median": (eval_sub['Pred_Base_Median'].values, show_base_med),
        "Baseline Last Year": (eval_sub['Pred_Base_Lag52'].values, show_base_lag52),
        "Ridge Regression": (eval_sub['Pred_Ridge'].values, show_ridge),
        "Random Forest": (eval_sub['Pred_RF'].values, show_rf),
        "Tuned XGBoost": (eval_sub['Pred_XGB'].values, show_xgb)
    }
    
    cols = st.columns(len(candidate_map))
    for i, (m_name, (preds, visible)) in enumerate(candidate_map.items()):
        m = compute_metrics(y_true, preds, h_arr)
        model_metrics[m_name] = m
        with cols[i]:
            border_style = "border: 2px solid #3B82F6;" if m_name == "Random Forest" else ""
            st.markdown(f"""
            <div class="metric-card" style="{border_style}">
                <div class="metric-label">{m_name}</div>
                <div class="metric-val">${m['WMAE']:,.1f}</div>
                <div style="font-size: 0.8rem; color: #4B5563; margin-top: 4px;">
                    MAE: ${m['MAE']:,.1f} | RMSE: ${m['RMSE']:,.1f}
                </div>
            </div>
            """, unsafe_allow_html=True)
else:
    st.info("No records match the selected filter for this department.")

# -----------------------------------------------------------------------------
# Interactive Time Series Plot (Plotly)
# -----------------------------------------------------------------------------
st.markdown("---")
st.subheader("Historical Trajectory & 39-Week Holdout Forecast Overlay")

fig = go.Figure()

# 1. Historical Actuals (Training Period: 2010 to Jan 2012)
if len(hist_sub) > 0:
    fig.add_trace(go.Scatter(
        x=hist_sub['Date'],
        y=hist_sub['Weekly_Sales'],
        mode='lines',
        name='Training History (Actual Sales)',
        line=dict(color='#9CA3AF', width=1.5, dash='dot'),
        opacity=0.7
    ))

# 2. Holdout Ground Truth (Actual Sales: Feb 2012 to Oct 2012)
if len(hold_sub) > 0:
    fig.add_trace(go.Scatter(
        x=hold_sub['Date'],
        y=hold_sub['Weekly_Sales'],
        mode='lines+markers',
        name='Actual Sales (Holdout Period)',
        line=dict(color='#111827', width=2.8),
        marker=dict(size=4)
    ))

    # 3. Model Predictions Overlays
    if show_base_med:
        fig.add_trace(go.Scatter(
            x=hold_sub['Date'], y=hold_sub['Pred_Base_Median'],
            mode='lines', name='Baseline: Historical Median',
            line=dict(color='#6B7280', width=1.8, dash='dash')
        ))
    if show_base_lag52:
        fig.add_trace(go.Scatter(
            x=hold_sub['Date'], y=hold_sub['Pred_Base_Lag52'],
            mode='lines', name='Baseline: Same Week Last Year',
            line=dict(color='#06B6D4', width=1.8, dash='dashdot')
        ))
    if show_ridge:
        fig.add_trace(go.Scatter(
            x=hold_sub['Date'], y=hold_sub['Pred_Ridge'],
            mode='lines', name='Candidate 1: Ridge Regression',
            line=dict(color='#3B82F6', width=2.0)
        ))
    if show_rf:
        fig.add_trace(go.Scatter(
            x=hold_sub['Date'], y=hold_sub['Pred_RF'],
            mode='lines', name='Candidate 2: Random Forest',
            line=dict(color='#F97316', width=2.2)
        ))
    if show_xgb:
        fig.add_trace(go.Scatter(
            x=hold_sub['Date'], y=hold_sub['Pred_XGB'],
            mode='lines', name='Optimal: Tuned XGBoost',
            line=dict(color='#10B981', width=2.2)
        ))

    # Add vertical shading for known major retail holiday weeks
    holidays = [
        ("2010-02-12", "Super Bowl 2010"),
        ("2010-09-10", "Labor Day 2010"),
        ("2010-11-26", "Thanksgiving 2010"),
        ("2010-12-31", "Christmas 2010"),
        ("2011-02-11", "Super Bowl 2011"),
        ("2011-09-09", "Labor Day 2011"),
        ("2011-11-25", "Thanksgiving 2011"),
        ("2011-12-30", "Christmas 2011"),
        ("2012-02-10", "Super Bowl 2012"),
        ("2012-09-07", "Labor Day 2012")
    ]
    
    for h_date, h_name in holidays:
        h_dt = pd.to_datetime(h_date)
        if hist_sub['Date'].min() <= h_dt <= hold_sub['Date'].max():
            fig.add_vrect(
                x0=h_dt - pd.Timedelta(days=3),
                x1=h_dt + pd.Timedelta(days=3),
                fillcolor="#FEE2E2", opacity=0.4,
                layer="below", line_width=0,
                annotation_text=h_name if "2012" in h_name else "",
                annotation_position="top left",
                annotation_font_size=9
            )

    # Vertical line dividing Train and Holdout
    fig.add_vline(
        x=pd.to_datetime('2012-02-03'),
        line_width=2, line_dash="solid", line_color="#DC2626",
        annotation_text="Holdout Cutoff (2012-02-03)",
        annotation_position="bottom right",
        annotation_font_color="#DC2626"
    )

fig.update_layout(
    height=540,
    margin=dict(l=40, r=40, t=30, b=40),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    xaxis_title="Date (Weekly Intervals)",
    yaxis_title="Weekly Sales ($ USD)",
    hovermode="x unified",
    template="plotly_white"
)

st.plotly_chart(fig, use_container_width=True)

# -----------------------------------------------------------------------------
# Overall Benchmark Summary Table
# -----------------------------------------------------------------------------
st.markdown("---")
st.subheader("Global Out-of-Time Benchmark (All 45 Stores & 81 Departments)")

if metrics_summary:
    rows = []
    for model_name, data in metrics_summary.items():
        ov = data['Overall']
        hol = data['Holiday_Only']
        reg = data['Regular_Only']
        rows.append({
            "Model Architecture": model_name,
            "Overall WMAE ($)": f"${ov['WMAE']:,.2f}",
            "Overall MAE ($)": f"${ov['MAE']:,.2f}",
            "Overall RMSE ($)": f"${ov['RMSE']:,.2f}",
            "Overall R²": f"{ov['R2']:.4f}",
            "Holiday MAE ($)": f"${hol['MAE']:,.2f}",
            "Regular MAE ($)": f"${reg['MAE']:,.2f}",
            "Holiday Inflation Ratio": f"{data['Holiday_Inflation_Ratio']:.2f}x"
        })
    df_metrics = pd.DataFrame(rows)
    st.dataframe(df_metrics, use_container_width=True, hide_index=True)
else:
    st.info("Global summary metrics will appear once pipeline completes.")

st.caption("ES 335 Term Project: Built with Streamlit, Scikit-Learn, XGBoost, and Plotly.")
