import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Download, AlertTriangle, Play } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const BatchScoring: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scoringResults, setScoringResults] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScoringResults(null);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.batchPredictCSV(file);
      setScoringResults(res);
    } catch (err: any) {
      setError(err.message || 'Batch scoring failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResultsCSV = () => {
    if (!scoringResults?.scored_preview) return;
    const items = scoringResults.scored_preview;
    const headers = Object.keys(items[0]);
    const rows = items.map((item: any) => headers.map(h => `"${(item[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `batch_churn_scored_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
          Bulk CSV Batch Scoring Workbench
        </h2>
        <p className="text-xs text-slate-400">
          Upload customer CSV files without Churn target to generate batch churn predictions, probabilities, risk tiers, and action plans.
        </p>
      </div>

      {/* CSV Upload Area */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center transition-all bg-slate-950/40">
            <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">
              {file ? file.name : 'Drag & drop customer CSV file here, or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports standard CSV format with required customer features</p>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-4 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Scoring Batch CSV Dataset...</span>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Batch Scoring Pipeline</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Workbench */}
      {scoringResults && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Batch Scoring Completed ({scoringResults.total_rows.toLocaleString()} Records Scored)
              </h3>
              <p className="text-xs text-slate-400">Previewing first 50 scored records</p>
            </div>

            <button
              onClick={handleDownloadResultsCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Scored CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Prediction</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Primary Driver</th>
                  <th className="py-3 px-4">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scoringResults.scored_preview.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">{row.CustomerID}</td>
                    <td className="py-3 px-4 font-semibold text-rose-400">{row['Churn Prediction']}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{(row['Churn Probability'] * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4"><RiskBadge level={row['Risk Level']} size="sm" /></td>
                    <td className="py-3 px-4"><RiskBadge level={row['Priority']} size="sm" /></td>
                    <td className="py-3 px-4 font-medium text-slate-300">{row['Primary Driver']}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{row['Recommended Action']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
