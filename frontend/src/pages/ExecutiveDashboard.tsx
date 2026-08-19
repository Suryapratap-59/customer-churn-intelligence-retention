import React, { useEffect, useState } from 'react';
import { 
  Users, UserX, UserCheck, AlertTriangle, TrendingUp, ShieldAlert,
  ArrowRight, Activity, DollarSign
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import type { DashboardSummaryResponse } from '../types';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';

interface ExecutiveDashboardProps {
  onNavigate: (tab: string, customerId?: number) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Executive Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Dashboard unavailable'}</p>
        <button 
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-500"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { kpis, risk_distribution, churn_drivers, churn_by_contract, churn_by_subscription, immediate_attention } = data;

  const churnPieData = [
    { name: 'Retained', value: kpis.retained_customers, color: '#10B981' },
    { name: 'Churned', value: kpis.churned_customers, color: '#EF4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Customers"
          value={kpis.total_customers.toLocaleString()}
          subtitle="Processed in current dataset"
          icon={Users}
          iconColor="text-indigo-400 bg-indigo-950/50 border-indigo-800/60"
        />
        <KPICard
          title="Overall Churn Rate"
          value={`${kpis.churn_rate_pct}%`}
          subtitle={`${kpis.churned_customers.toLocaleString()} churned customers`}
          trend="+0.4%"
          trendPositive={false}
          icon={TrendingUp}
          iconColor="text-rose-400 bg-rose-950/50 border-rose-800/60"
        />
        <KPICard
          title="High-Risk Customers"
          value={kpis.high_risk_count.toLocaleString()}
          subtitle="Immediate action recommended"
          trend="Requires Contact"
          trendPositive={false}
          icon={ShieldAlert}
          iconColor="text-amber-400 bg-amber-950/50 border-amber-800/60"
        />
        <KPICard
          title="Retained Customers"
          value={kpis.retained_customers.toLocaleString()}
          subtitle={`${(100 - kpis.churn_rate_pct).toFixed(1)}% retention rate`}
          icon={UserCheck}
          iconColor="text-emerald-400 bg-emerald-950/50 border-emerald-800/60"
        />
      </div>

      {/* Main Dashboard Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Churn Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-100">Churn Distribution</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ratio</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={churnPieData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {churnPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Tier Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-100">Risk Tier Classification</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tiers</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={risk_distribution} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {risk_distribution.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Churn Drivers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-100">Top Churn Drivers</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Global Weight %</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={churn_drivers} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={10} unit="%" />
                <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={11} width={110} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Contract & Subscription Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn by Contract Length */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Churn Rate by Contract Length</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_contract} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="contract" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="churn_rate" fill="#EF4444" name="Churn Rate (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Subscription Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Churn Rate by Subscription Tier</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churn_by_subscription} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="subscription" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="churn_rate" fill="#F59E0B" name="Churn Rate (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Immediate Attention Required Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Immediate Attention Required
            </h3>
            <p className="text-xs text-slate-400">High-risk customer accounts requiring urgent retention outreach</p>
          </div>

          <button
            onClick={() => onNavigate('risk-queue')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-md text-xs font-semibold transition-all"
          >
            <span>View Full Risk Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Churn Prob</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Primary Driver</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {immediate_attention.map((c) => (
                <tr key={c.customer_id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    CUST-{c.customer_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-400">
                    {c.churn_probability_pct}
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={c.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={c.priority_label} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">
                    {c.primary_risk_driver}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-md truncate">
                    {c.recommended_action}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('customer-profiles', c.customer_id)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
