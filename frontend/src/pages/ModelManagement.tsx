import React, { useEffect, useState } from 'react';
import { Settings2, RefreshCw, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';
import { api } from '../services/api';
import type { ModelPerformanceResponse } from '../types';

export const ModelManagement: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    setLoading(true);
    try {
      const res = await api.getModelPerformance();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrainPipeline = async () => {
    setRetraining(true);
    setRetrainSuccess(null);
    try {
      const res = await api.retrainModel();
      setRetrainSuccess(`Retraining finished! Selected active model: ${res.details.best_model}`);
      await loadModelInfo();
    } catch (err: any) {
      alert(`Retraining error: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading model version registry...</p>
      </div>
    );
  }

  const activeModel = data?.active_model || 'Random Forest';
  const activeEval = data?.evaluation_matrix[activeModel];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            Model Lifecycle & Version Management Registry
          </h2>
          <p className="text-xs text-slate-400">
            Monitor active production classifier, inspect hyperparameter versions, and trigger automated retraining.
          </p>
        </div>

        <button
          onClick={handleRetrainPipeline}
          disabled={retraining}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Retraining Models...' : 'Retrain ML Engine'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{retrainSuccess}</span>
        </div>
      )}

      {/* Active Model Status Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">{activeModel}</h3>
              <span className="text-xs text-slate-400">Active Production Classification Model</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold">
            Status: Production
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Accuracy:</span>
            <span className="text-lg font-bold text-slate-100">{activeEval ? (activeEval.accuracy * 100).toFixed(2) : 0}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">Churn Recall:</span>
            <span className="text-lg font-bold text-rose-400">{activeEval ? (activeEval.recall * 100).toFixed(2) : 0}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">F1 Score:</span>
            <span className="text-lg font-bold text-indigo-400">{activeEval ? (activeEval.f1_score * 100).toFixed(2) : 0}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">ROC-AUC:</span>
            <span className="text-lg font-bold text-slate-100">{activeEval ? (activeEval.roc_auc * 100).toFixed(2) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
