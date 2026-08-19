import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Download, ArrowUpDown, ShieldAlert, ChevronLeft, ChevronRight,
  Sparkles, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictionResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface RiskQueueProps {
  onSelectCustomer: (customerId: number) => void;
}

export const RiskQueue: React.FC<RiskQueueProps> = ({ onSelectCustomer }) => {
  const [customers, setCustomers] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState<number>(1);
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [contractFilter, setContractFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [highValueHighRisk, setHighValueHighRisk] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    loadQueue();
  }, [page, riskFilter, contractFilter, highValueHighRisk]);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCustomers({
        page,
        limit: 15,
        risk_filter: riskFilter,
        contract_filter: contractFilter,
        search,
        high_value_high_risk: highValueHighRisk
      });
      setCustomers(res.customers);
      setTotalCount(res.total_count);
    } catch (err: any) {
      setError(err.message || 'Failed to load risk queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQueue();
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = [
      'Priority', 'CustomerID', 'ChurnProbability', 'RiskLevel', 
      'PrimaryDriver', 'RecommendedAction'
    ];
    const rows = customers.map(c => [
      c.priority_label,
      c.customer_id,
      c.churn_probability,
      c.risk_level,
      `"${c.primary_risk_driver}"`,
      `"${c.recommended_action.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer_risk_queue_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Customer Risk Prioritization Queue
          </h2>
          <p className="text-xs text-slate-400">
            Actionable queue ranked by churn probability and business value score
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setHighValueHighRisk(!highValueHighRisk);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 border transition-all ${
              highValueHighRisk
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>High Value + High Risk Filter</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          {['All', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setRiskFilter(tier);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                riskFilter === tier
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier === 'All' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>

        {/* Contract Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Contract:</span>
          <select
            value={contractFilter}
            onChange={(e) => {
              setContractFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Contracts</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Scoring customer risk queue...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400">
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No high-risk customers match current filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try relaxing search or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 uppercase text-[10px] tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Churn Prob</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Primary Driver</th>
                  <th className="py-3 px-4">Recommended Retention Action</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3.5 px-4">
                      <RiskBadge level={c.priority_label} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                      CUST-{c.customer_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">
                      {c.churn_probability_pct}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={c.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {c.primary_risk_driver}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-lg truncate">
                      {c.recommended_action}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCustomer(c.customer_id)}
                        className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded transition-all inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {page} of customer risk queue</span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
