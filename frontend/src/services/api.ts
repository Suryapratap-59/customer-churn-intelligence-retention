import type { 
  DashboardSummaryResponse, CustomerQueueResponse, PredictionResult,
  ModelPerformanceResponse, DataQualitySummary 
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errBody.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  getHealth: () => fetchJSON<{ status: string; model_trained: boolean; active_model: string; dataset_loaded: boolean }>('/health'),
  
  getDashboardSummary: () => fetchJSON<DashboardSummaryResponse>('/dashboard/summary'),
  
  getCustomers: (params?: { page?: number; limit?: number; risk_filter?: string; contract_filter?: string; search?: string; high_value_high_risk?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.risk_filter && params.risk_filter !== 'All') q.set('risk_filter', params.risk_filter);
    if (params?.contract_filter && params.contract_filter !== 'All') q.set('contract_filter', params.contract_filter);
    if (params?.search) q.set('search', params.search);
    if (params?.high_value_high_risk) q.set('high_value_high_risk', 'true');
    return fetchJSON<CustomerQueueResponse>(`/customers?${q.toString()}`);
  },

  getCustomerById: (id: number) => fetchJSON<{ raw_attributes: any; intelligence: PredictionResult }>(`/customers/${id}`),

  predictSingle: (data: any) => fetchJSON<PredictionResult>('/predict', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  batchPredictCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/batch-predict`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Batch scoring failed' }));
      throw new Error(err.detail);
    }
    return res.json();
  },

  getChurnAnalytics: () => fetchJSON<any>('/analytics/churn'),

  getModelPerformance: () => fetchJSON<ModelPerformanceResponse>('/model/performance'),

  getExplainability: () => fetchJSON<{ global_importance: any[]; methodology: string }>('/model/explainability'),

  retrainModel: () => fetchJSON<{ status: string; message: string; details: any }>('/model/retrain', {
    method: 'POST',
  }),

  getDataQuality: () => fetchJSON<DataQualitySummary>('/data-quality'),

  recordRetentionOutcome: (payload: { customer_id: number; risk_level: string; action_taken: string; outcome: string; notes?: string }) => fetchJSON<{ status: string; recorded_outcome_id: number }>('/retention/outcome', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getRetentionOutcomes: () => fetchJSON<any[]>('/retention/outcomes'),

  getSettings: () => fetchJSON<{ low_risk_threshold: number; high_risk_threshold: number; active_model_name: string }>('/settings'),

  updateSettings: (payload: { low_risk_threshold: number; high_risk_threshold: number }) => fetchJSON<any>('/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
