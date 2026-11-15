export interface ProjectMetadata {
  title: string;
  short_title: string;
  course: string;
  institute: string;
  semester: string;
  team: { name: string; roll: string; role: string }[];
  topic: string;
  task_type: string;
  target_definition: string;
  row_representation?: string;
  primary_research_question: string;
  primary_metric: string;
  metric_justification: string;
  verdict: {
    supported: boolean;
    headline: string;
    summary: string;
  };
}

export interface FileSchemaItem {
  col: string;
  type: string;
  desc: string;
}

export interface FileInventoryItem {
  filename: string;
  rows: number;
  columns: number;
  size_mb: number;
  role: string;
  keys: string[];
  schema: FileSchemaItem[];
}

export interface DatasetArchitecture {
  files: FileInventoryItem[];
  total_records: number;
  train_records: number;
  test_records: number;
  unique_stores: number;
  unique_depts: number;
  train_time_series: number;
  test_time_series: number;
  cold_start_series_count: number;
  cold_start_test_rows: number;
  leakage_firewall: {
    past_window: string;
    cutoff_date: string;
    validation_window: string;
    test_window: string;
  };
  accuracy_trap_callout: string;
}

export interface Finding {
  id: number;
  badge: string;
  title: string;
  stat: string;
  description: string;
}

export interface KPIItem {
  label: string;
  value: string;
  sub: string;
  trend: string;
  tone: "positive" | "negative" | "neutral";
}

export interface FeatureDomain {
  id: string;
  name: string;
  color: string;
  count: number;
  features: string[];
  description: string;
}

export interface FeatureCatalogueItem {
  name: string;
  domain: string;
  missing_pct: number;
  unique: number;
  median: number;
  importance_gain: number;
  univariate_corr: number;
  desc: string;
}

export interface ModelLadderItem {
  rank: number;
  name: string;
  family: string;
  train_wmae: number;
  val_wmae: number;
  gen_gap: number;
  val_mae: number;
  val_rmse: number;
  val_r2: number;
  holiday_mae: number;
  holiday_ratio: number;
  train_sec: number;
  infer_sec: number;
  role: string;
}

export interface AblationItem {
  configuration: string;
  val_wmae: number;
  delta: string;
  r2: number;
  desc: string;
}

export interface ErrorLimitation {
  id: number;
  title: string;
  risk: string;
  mitigation: string;
}

export interface RepresentativeFailureItem {
  store: number;
  dept: number;
  dept_name: string;
  store_type: string;
  store_size: number;
  direction: string;
  mean_actual: number;
  mean_predicted: number;
  mean_gap: number;
  wmae: number;
  root_cause: string;
}

export interface EmpiricalConfusionMatrixItem {
  threshold: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  actual_positives: number;
  actual_negatives: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  type1Cost: number;
  type2Cost: number;
  totalCost: number;
}

export interface StatisticalTestItem {
  comparison: string;
  wmae_reduction: number;
  percentage_gain: number;
  paired_t_statistic: number;
  p_value_t_test: number;
  wilcoxon_p_value?: number;
  bootstrap_95_ci?: [number, number];
  significant_at_alpha_0_001: boolean;
  interpretation: string;
}

export interface QnAItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface PredictorPreset {
  id: string;
  name: string;
  store: number;
  dept: number;
  type: string;
  size: number;
  week: number;
  is_holiday: number;
  temperature: number;
  fuel_price: number;
  cpi: number;
  unemployment: number;
  markdown_total: number;
  expected_sales: number;
  risk_tier: string;
  risk_color: string;
  recommended_action: string;
}

export interface FullResults {
  metadata: ProjectMetadata;
  dataset_architecture: DatasetArchitecture;
  findings: Finding[];
  kpis: KPIItem[];
  feature_domains: FeatureDomain[];
  feature_catalogue: FeatureCatalogueItem[];
  model_ladder: ModelLadderItem[];
  ablations: AblationItem[];
  champion_params: Record<string, any>;
  error_analysis: {
    asymmetry: {
      type_1: { title: string; operational_meaning: string; business_cost: string };
      type_2: { title: string; operational_meaning: string; business_cost: string };
    };
    operating_rule: string;
    limitations: ErrorLimitation[];
    representative_failures?: {
      summary: string;
      under_predicted: RepresentativeFailureItem[];
      over_predicted: RepresentativeFailureItem[];
    };
    empirical_confusion_matrices?: Record<string, EmpiricalConfusionMatrixItem>;
  };
  statistical_tests?: Record<string, StatisticalTestItem>;
  data_studio: {
    cohort_overlap: any;
    store_type_deep_dive: any[];
    top_departments: any[];
  };
  diagnostic_curves: {
    tolerance_curve: { threshold_pct: number; base_pct: number; ridge_pct: number; rf_pct: number; xgb_pct: number }[];
    residual_distribution: { bin: string; count: number; model: string }[];
    roc_curve: { fpr: number; tpr: number; precision: number; recall: number }[];
    weekly_seasonality: { week: number; avg_sales: number; holiday: boolean; event?: string }[];
  };
  oral_defense_qna: QnAItem[];
  predictor_config: {
    presets: PredictorPreset[];
  };
}
