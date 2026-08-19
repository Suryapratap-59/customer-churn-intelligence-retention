import React from 'react';
import { Search, Bell, ShieldCheck, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  activeModelName?: string;
  onRetrain?: () => void;
  isRetraining?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  activeModelName = 'Random Forest', 
  onRetrain, 
  isRetraining = false 
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-bold text-slate-100 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400">Customer Risk & Retention Decision Support</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Model Status Badge */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Active Model:</span>
          <span className="font-semibold text-slate-200">{activeModelName}</span>
        </div>

        {/* Quick Retrain Action */}
        {onRetrain && (
          <button
            onClick={onRetrain}
            disabled={isRetraining}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining...' : 'Retrain Engine'}</span>
          </button>
        )}

        <div className="w-px h-6 bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            RM
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-slate-200">Retention Ops</div>
            <div className="text-[10px] text-slate-400">Enterprise Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
