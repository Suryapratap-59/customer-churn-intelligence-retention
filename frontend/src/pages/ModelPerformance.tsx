import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { ModelPerformanceResponse } from '../types';

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getModelPerformance();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load model performance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Evaluating classification metrics across 4 baseline models...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Model performance unavailable'}</p>
      </div>
    );
  }

  const { active_model, evaluation_matrix, hyperparameter_tuning, selection_rationale } = data;
  const activeEval = evaluation_matrix[active_model];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Machine Learning Pipeline & Model Performance Hub
          </h2>
          <p className="text-xs text-slate-400">
            Comparative evaluation of Logistic Regression, Random Forest, Support Vector Machine, and K-Nearest Neighbors on unseen test split.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-2 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">Active Production Model: {active_model}</span>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Baseline Models Comparison Matrix (80/20 Test Split)
          </h3>
          <span className="text-[10px] text-slate-400 italic">Evaluated on 12,875 unseen test customers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision (Churn)</th>
                <th className="py-3 px-4">Recall (Churn)</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Train Time (s)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.values(evaluation_matrix).map((m) => {
                const isActive = m.model_name === active_model;
                return (
                  <tr key={m.model_name} className={`transition-all ${isActive ? 'bg-indigo-950/30 font-semibold text-slate-100' : 'hover:bg-slate-800/40'}`}>
                    <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                      {m.model_name}
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono">{(m.roc_auc * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{m.training_time_sec}s</td>
                    <td className="py-3.5 px-4 text-right">
                      {isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md text-[11px] font-bold">
                          Selected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-md text-[11px]">
                          Baseline
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix vs Hyperparameter Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Card */}
        {activeEval && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              Active Model Confusion Matrix ({active_model})
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">True Negative (Retained)</span>
                <span className="text-2xl font-black text-emerald-300 mt-1 block">
                  {activeEval.confusion_matrix[0][0].toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Correctly identified retained customers</span>
              </div>

              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">False Positive (False Alarm)</span>
                <span className="text-2xl font-black text-amber-300 mt-1 block">
                  {activeEval.confusion_matrix[0][1].toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Unnecessary retention intervention cost</span>
              </div>

              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-lg">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">False Negative (Missed Churn)</span>
                <span className="text-2xl font-black text-rose-300 mt-1 block">
                  {activeEval.confusion_matrix[1][0].toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Most costly business error (Lost customer)</span>
              </div>

              <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-lg">
                <span className="text-[10px] text-indigo-400 uppercase font-bold block">True Positive (Caught Churn)</span>
                <span className="text-2xl font-black text-indigo-300 mt-1 block">
                  {activeEval.confusion_matrix[1][1].toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Successfully identified churn risk</span>
              </div>
            </div>
          </div>
        )}

        {/* Hyperparameter Tuning Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            GridSearchCV Hyperparameter Optimization
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Baseline Test F1 Score:</span>
              <span className="font-mono font-bold text-slate-200">{hyperparameter_tuning.baseline_f1}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Tuned Test F1 Score:</span>
              <span className="font-mono font-bold text-indigo-400">{hyperparameter_tuning.tuned_f1}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Cross-Validation Best Score:</span>
              <span className="font-mono font-bold text-emerald-400">{hyperparameter_tuning.best_cv_score}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Net Score Improvement:</span>
              <span className="font-mono font-bold text-emerald-400">+{hyperparameter_tuning.f1_improvement}</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 block mb-1.5 font-semibold">Best Hyperparameters Selected:</span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-indigo-300 font-mono overflow-x-auto">
                {JSON.stringify(hyperparameter_tuning.best_params || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Business Selection Rationale */}
      <div className="bg-slate-900 border border-indigo-900/60 p-5 rounded-xl space-y-2">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          Business Selection Strategy & Model Rationale
        </h4>
        <p className="text-xs text-indigo-200 leading-relaxed">{selection_rationale}</p>
      </div>
    </div>
  );
};
