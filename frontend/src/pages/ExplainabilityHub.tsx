import React, { useEffect, useState } from 'react';
import { Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../services/api';

export const ExplainabilityHub: React.FC = () => {
  const [data, setData] = useState<{ global_importance: any[]; methodology: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadExplainability();
  }, []);

  const loadExplainability = async () => {
    setLoading(true);
    try {
      const res = await api.getExplainability();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Extracting global feature attribution weights...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Explainability Engine (Global vs Individual Attribution)
        </h2>
        <p className="text-xs text-slate-400">
          Transparent model decision intelligence explaining what generally drives customer churn across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Feature Importance Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            Global Feature Importance Ranking (%)
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data?.global_importance || []} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} unit="%" />
                <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={11} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="importance" fill="#6366F1" radius={[0, 4, 4, 0]} name="Global Weight (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Explainability Methodology (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Dual-Layer Explainability Framework
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="font-bold text-indigo-300 block">1. Global Explainability</span>
                <p className="text-slate-400">
                  Answers "What generally influences churn across all customers?" Identifies core drivers like Payment Delay and Support Calls.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="font-bold text-indigo-300 block">2. Individual Customer Attribution</span>
                <p className="text-slate-400">
                  Answers "Why is THIS specific customer at risk?" Evaluates custom behavioral metrics against domain risk benchmarks to isolate top individual drivers.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-xs text-indigo-200">
            <span className="font-semibold block mb-1">Attribution Methodology:</span>
            <p className="text-[11px] leading-relaxed">{data?.methodology}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
