export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type PriorityLabel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface KPIStats {
  total_customers: number;
  churned_customers: number;
  retained_customers: number;
  churn_rate_pct: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

export interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface ChurnDriver {
  feature: string;
  display_name: string;
  importance: number;
}

export interface ChurnByContract {
  contract: string;
  total: number;
  churned: number;
  churn_rate: number;
}

export interface ChurnBySubscription {
  subscription: string;
  total: number;
  churned: number;
  churn_rate: number;
}

export interface RiskDriverExplanation {
  factor: string;
  impact: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface PredictionResult {
  customer_id: number;
  churn_prediction: number;
  churn_probability: number;
  churn_probability_pct: string;
  risk_level: RiskLevel;
  priority_score: number;
  priority_label: PriorityLabel;
  primary_risk_driver: string;
  recommended_action: string;
  action_items?: string[];
  risk_drivers: RiskDriverExplanation[];
  suggested_owner?: string;
  model_version: string;
  Total_Spend?: number;
  [key: string]: any;
}

export interface DashboardSummaryResponse {
  kpis: KPIStats;
  risk_distribution: RiskDistributionItem[];
  churn_drivers: ChurnDriver[];
  churn_by_contract: ChurnByContract[];
  churn_by_subscription: ChurnBySubscription[];
  immediate_attention: PredictionResult[];
}

export interface CustomerQueueResponse {
  total_count: number;
  page: number;
  limit: number;
  customers: PredictionResult[];
}

export interface ModelEvalItem {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  training_time_sec: number;
  composite_score: number;
}

export interface ModelPerformanceResponse {
  active_model: string;
  evaluation_matrix: Record<string, ModelEvalItem>;
  hyperparameter_tuning: {
    model_name?: string;
    baseline_f1?: number;
    tuned_f1?: number;
    f1_improvement?: number;
    best_params?: Record<string, any>;
    best_cv_score?: number;
    tuning_time_sec?: number;
  };
  selection_rationale: string;
}

export interface DataQualitySummary {
  is_valid: boolean;
  issues: string[];
  warnings: string[];
  summary: {
    total_rows: number;
    total_columns: number;
    column_names: string[];
    missing_values: Record<string, number>;
    exact_duplicate_rows: number;
    duplicate_customer_ids: number;
    target_distribution?: {
      counts: Record<string, number>;
      proportions: Record<string, number>;
    };
  };
}
