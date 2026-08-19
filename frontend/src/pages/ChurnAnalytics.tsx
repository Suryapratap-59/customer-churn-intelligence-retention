import React, { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';

export const ChurnAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getChurnAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load churn analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Aggregating exploratory dataset analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Analytics unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Exploratory Churn Behavior Analytics
        </h2>
        <p className="text-xs text-slate-400">
          In-depth breakdown of key behavioral features against churn distribution (0 = Retained, 1 = Churned).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Delay vs Churn */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Payment Delay (Days) vs Churn Count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.payment_delay_vs_churn} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="Payment Delay" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="0" fill="#10B981" name="Retained (0)" stackId="a" />
                <Bar dataKey="1" fill="#EF4444" name="Churned (1)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support Calls vs Churn */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Support Calls Count vs Churn Count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.support_calls_vs_churn} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="Support Calls" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="0" fill="#10B981" name="Retained (0)" stackId="a" />
                <Bar dataKey="1" fill="#EF4444" name="Churned (1)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Frequency vs Churn */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Usage Frequency vs Churn Count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usage_frequency_vs_churn} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="Usage Frequency" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="0" fill="#10B981" name="Retained (0)" stackId="a" />
                <Bar dataKey="1" fill="#EF4444" name="Churned (1)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contract Length vs Churn */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Contract Commitment Type vs Churn Count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contract_length_vs_churn} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="Contract Length" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="0" fill="#10B981" name="Retained (0)" />
                <Bar dataKey="1" fill="#EF4444" name="Churned (1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
