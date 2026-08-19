import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { DataQualitySummary } from '../types';

export const DataQuality: React.FC = () => {
  const [data, setData] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataQuality();
  }, []);

  const loadDataQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDataQuality();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load data quality summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Auditing dataset schema, data types, and missing values...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Data quality audit unavailable'}</p>
      </div>
    );
  }

  const { is_valid, issues, warnings, summary } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Data Quality & Ingestion Audit Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Real-time validation layer checking missing values, duplicate rows, schema integrity, and range bounds.
          </p>
        </div>

        <div className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
          is_valid ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-rose-950/80 text-rose-400 border-rose-800'
        }`}>
          {is_valid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{is_valid ? 'Dataset Schema Passed Validation' : 'Validation Issues Detected'}</span>
        </div>
      </div>

      {/* Warnings Banner */}
      {warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl space-y-1 text-xs text-amber-200">
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Data Quality Warnings & Observations:
          </span>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 block mb-1">Total Dataset Rows:</span>
          <span className="text-2xl font-bold text-slate-100">{summary.total_rows.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 block mb-1">Total Columns Recognized:</span>
          <span className="text-2xl font-bold text-slate-100">{summary.total_columns}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 block mb-1">Exact Duplicate Rows:</span>
          <span className="text-2xl font-bold text-emerald-400">{summary.exact_duplicate_rows}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 block mb-1">Duplicate CustomerIDs:</span>
          <span className="text-2xl font-bold text-emerald-400">{summary.duplicate_customer_ids}</span>
        </div>
      </div>

      {/* Missing Values & Column Types Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
          Recognized Feature Schema & Missing Values Count
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {summary.column_names.map((col) => {
            const missing = summary.missing_values[col] || 0;
            return (
              <div key={col} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-300">{col}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${missing > 0 ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                  {missing} nulls
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
