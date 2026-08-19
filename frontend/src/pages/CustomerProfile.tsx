import React, { useEffect, useState } from 'react';
import { 
  User, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowLeft,
  UserCheck, DollarSign, Activity, FileText, Send, PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictionResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface CustomerProfileProps {
  customerId?: number;
  onBack: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId = 1, onBack }) => {
  const [data, setData] = useState<{ raw_attributes: any; intelligence: PredictionResult } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Outcome recording state
  const [showOutcomeForm, setShowOutcomeForm] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<string>('Retained');
  const [notes, setNotes] = useState<string>('');
  const [recordSuccess, setRecordSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadProfile();
  }, [customerId]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCustomerById(customerId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      await api.recordRetentionOutcome({
        customer_id: customerId,
        risk_level: data.intelligence.risk_level,
        action_taken: data.intelligence.recommended_action,
        outcome,
        notes
      });
      setRecordSuccess(true);
      setShowOutcomeForm(false);
      setTimeout(() => setRecordSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to record outcome: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Extracting customer intelligence profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Customer not found'}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-md text-xs font-semibold">
          Back to Queue
        </button>
      </div>
    );
  }

  const { raw_attributes, intelligence } = data;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Risk Queue</span>
      </button>

      {/* Profile Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center font-bold text-indigo-400 text-xl shadow-inner">
            C
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100 font-mono">CUST-{customerId}</h1>
              <RiskBadge level={intelligence.risk_level} size="md" />
              <RiskBadge level={intelligence.priority_label} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Model: <span className="text-slate-200 font-semibold">{intelligence.model_version}</span>
            </p>
          </div>
        </div>

        {/* Churn Probability Gauge Card */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center gap-4 min-w-[240px]">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Churn Probability</div>
            <div className="text-3xl font-black text-rose-400 tracking-tight">
              {intelligence.churn_probability_pct}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-400">
            {intelligence.risk_level}
          </div>
        </div>
      </div>

      {recordSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Retention outcome successfully recorded in backend database!</span>
        </div>
      )}

      {/* Grid Layout: Demographics vs Behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Overview */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            Customer Demographics & Account Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Age:</span>
              <span className="font-semibold text-slate-200">{raw_attributes.Age} years</span>
            </div>
            <div>
              <span className="text-slate-400 block">Gender:</span>
              <span className="font-semibold text-slate-200">{raw_attributes.Gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tenure:</span>
              <span className="font-semibold text-slate-200">{raw_attributes.Tenure} months</span>
            </div>
            <div>
              <span className="text-slate-400 block">Subscription Type:</span>
              <span className="font-semibold text-slate-200">{raw_attributes['Subscription Type']}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Contract Length:</span>
              <span className="font-semibold text-slate-200">{raw_attributes['Contract Length']}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Spend:</span>
              <span className="font-semibold text-emerald-400">${raw_attributes['Total Spend']}</span>
            </div>
          </div>
        </div>

        {/* Behavioral Metrics */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-indigo-400" />
            Behavioral Activity & Service Touchpoints
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Usage Frequency:</span>
              <span className="font-semibold text-slate-200">{raw_attributes['Usage Frequency']} sessions/mo</span>
            </div>
            <div>
              <span className="text-slate-400 block">Support Calls:</span>
              <span className={`font-semibold ${raw_attributes['Support Calls'] >= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                {raw_attributes['Support Calls']} calls
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Delay:</span>
              <span className={`font-semibold ${raw_attributes['Payment Delay'] >= 10 ? 'text-rose-400' : 'text-slate-200'}`}>
                {raw_attributes['Payment Delay']} days
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Last Interaction:</span>
              <span className="font-semibold text-slate-200">{raw_attributes['Last Interaction']} days ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Risk Explanation (Why this customer is at risk) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Individual Risk Driver Attribution (Explainability Engine)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intelligence.risk_drivers.map((driver, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{driver.factor}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  driver.severity === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  driver.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {driver.impact}
                </span>
              </div>
              <p className="text-xs text-slate-400">{driver.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Retention Action Card */}
      <div className="bg-slate-900 border border-indigo-900/60 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 border-b border-indigo-900/60 pb-3">
          <FileText className="w-4 h-4 text-indigo-400" />
          Recommended Decision-Support Retention Strategy
        </h3>

        <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-lg space-y-2 text-xs text-indigo-200">
          <div className="font-semibold text-indigo-300">Suggested Action Plan:</div>
          <p className="leading-relaxed">{intelligence.recommended_action}</p>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
            <span>Priority: <strong className="text-slate-200">{intelligence.priority_label}</strong></span>
            <span>Suggested Owner: <strong className="text-slate-200">{intelligence.suggested_owner || 'Customer Success'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button 
            onClick={() => alert(`Customer CUST-${customerId} added to prioritized retention campaign queue.`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Add to Retention Queue</span>
          </button>

          <button 
            onClick={() => alert(`Marked CUST-${customerId} as Contacted.`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Mark Contacted</span>
          </button>

          <button 
            onClick={() => setShowOutcomeForm(!showOutcomeForm)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Record Outcome</span>
          </button>
        </div>

        {/* Outcome Recording Form */}
        {showOutcomeForm && (
          <form onSubmit={handleRecordOutcome} className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Record Intervention Feedback</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Intervention Outcome:</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5"
                >
                  <option value="Retained">Retained (Success)</option>
                  <option value="Churned">Churned (Unsuccessful)</option>
                  <option value="Pending">Pending Contact</option>
                  <option value="No Response">No Response</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Intervention Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Offered 15% annual plan discount..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOutcomeForm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded text-xs hover:bg-emerald-500"
              >
                Save Outcome
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
