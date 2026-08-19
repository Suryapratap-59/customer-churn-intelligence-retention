import React, { useEffect, useState } from 'react';
import { Sliders, Save, CheckCircle2, History, Database } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [lowThreshold, setLowThreshold] = useState<number>(0.35);
  const [highThreshold, setHighThreshold] = useState<number>(0.70);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadSettingsAndOutcomes();
  }, []);

  const loadSettingsAndOutcomes = async () => {
    setLoading(true);
    try {
      const settingsRes = await api.getSettings();
      setLowThreshold(settingsRes.low_risk_threshold);
      setHighThreshold(settingsRes.high_risk_threshold);

      const outcomesRes = await api.getRetentionOutcomes();
      setOutcomes(outcomesRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        low_risk_threshold: lowThreshold,
        high_risk_threshold: highThreshold
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Risk Engine Configuration & Retention Audit Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure risk probability boundaries (Low / Medium / High Risk) and inspect recorded retention intervention outcomes.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurable risk thresholds successfully updated!</span>
        </div>
      )}

      {/* Threshold Configurator */}
      <form onSubmit={handleSaveThresholds} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
          Risk Classification Probability Thresholds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Low Risk Ceiling (Probability &lt; X):
            </label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="0.50"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(parseFloat(e.target.value) || 0.35)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default: 0.35 (35% probability ceiling for Low Risk)
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              High Risk Floor (Probability &ge; Y):
            </label>
            <input
              type="number"
              step="0.05"
              min="0.51"
              max="0.95"
              value={highThreshold}
              onChange={(e) => setHighThreshold(parseFloat(e.target.value) || 0.70)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default: 0.70 (70% probability threshold for High Risk)
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Threshold Settings</span>
        </button>
      </form>

      {/* Recorded Retention Intervention Log */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          Recorded Retention Interventions Audit Log ({outcomes.length})
        </h3>

        {outcomes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No retention intervention outcomes recorded in database yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Customer ID</th>
                  <th className="py-2.5 px-3">Risk at Intervention</th>
                  <th className="py-2.5 px-3">Action Taken</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {outcomes.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-100">CUST-{o.customer_id}</td>
                    <td className="py-2.5 px-3">{o.risk_level_at_intervention}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate">{o.action_taken}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">{o.outcome}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
