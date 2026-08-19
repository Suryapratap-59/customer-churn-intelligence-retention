import React, { useState } from 'react';
import { Calculator, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { PredictionResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const PredictCustomer: React.FC = () => {
  const [formData, setFormData] = useState({
    CustomerID: 99999,
    Age: 42,
    Gender: 'Female',
    Tenure: 12,
    'Usage Frequency': 8,
    'Support Calls': 6,
    'Payment Delay': 18,
    'Subscription Type': 'Standard',
    'Contract Length': 'Monthly',
    'Total Spend': 650,
    'Last Interaction': 20
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictSingle(formData);
      setPrediction(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          Single Customer Churn Prediction Engine
        </h2>
        <p className="text-xs text-slate-400">
          Enter customer attributes to evaluate real-time churn probability, risk classification, and decision-support retention actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            Customer Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Customer Age (Years):</label>
              <input
                type="number"
                min={18}
                max={100}
                value={formData.Age}
                onChange={(e) => handleChange('Age', parseInt(e.target.value) || 18)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Gender:</label>
              <select
                value={formData.Gender}
                onChange={(e) => handleChange('Gender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tenure (Months):</label>
              <input
                type="number"
                min={0}
                max={120}
                value={formData.Tenure}
                onChange={(e) => handleChange('Tenure', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Usage Frequency (sessions/mo):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData['Usage Frequency']}
                onChange={(e) => handleChange('Usage Frequency', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Support Calls Count:</label>
              <input
                type="number"
                min={0}
                max={50}
                value={formData['Support Calls']}
                onChange={(e) => handleChange('Support Calls', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payment Delay (Days):</label>
              <input
                type="number"
                min={0}
                max={90}
                value={formData['Payment Delay']}
                onChange={(e) => handleChange('Payment Delay', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Subscription Type:</label>
              <select
                value={formData['Subscription Type']}
                onChange={(e) => handleChange('Subscription Type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Contract Length:</label>
              <select
                value={formData['Contract Length']}
                onChange={(e) => handleChange('Contract Length', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Total Spend ($):</label>
              <input
                type="number"
                min={0}
                value={formData['Total Spend']}
                onChange={(e) => handleChange('Total Spend', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Last Interaction (Days ago):</label>
              <input
                type="number"
                min={0}
                max={365}
                value={formData['Last Interaction']}
                onChange={(e) => handleChange('Last Interaction', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Evaluating Model...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Churn Risk & Retention Action</span>
              </>
            )}
          </button>
        </form>

        {/* Prediction Results Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
              Prediction Intelligence Output
            </h3>

            {error && (
              <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
                {error}
              </div>
            )}

            {!prediction && !loading && !error && (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Fill out parameters and click evaluate to view predictions.</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-5">
                {/* Result Card */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Churn Probability</span>
                    <RiskBadge level={prediction.risk_level} size="md" />
                  </div>

                  <div className="text-4xl font-black text-rose-400 tracking-tight">
                    {prediction.churn_probability_pct}
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-3">
                    <span className="text-slate-400">Model Prediction:</span>
                    <span className={`font-bold ${prediction.churn_prediction === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {prediction.churn_prediction === 1 ? 'Likely to Churn' : 'Retained'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Priority Tier:</span>
                    <RiskBadge level={prediction.priority_label} size="sm" />
                  </div>
                </div>

                {/* Risk Drivers */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Primary Risk Drivers:</h4>
                  <div className="space-y-1.5">
                    {prediction.risk_drivers.map((d, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs">
                        <div className="font-semibold text-slate-300">{d.factor}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{d.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-indigo-300 block">Recommended Action:</span>
                  <p className="text-indigo-200 text-[11px] leading-relaxed">{prediction.recommended_action}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
