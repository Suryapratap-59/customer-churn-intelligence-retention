import React from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Calculator, BarChart3, 
  Cpu, Sparkles, UploadCloud, Database, Settings2, Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'executive-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'risk-queue', label: 'Customer Risk Queue', icon: Users },
    { id: 'customer-profiles', label: 'Customer Profiles', icon: UserCheck },
    { id: 'predict-customer', label: 'Predict Customer', icon: Calculator },
    { id: 'churn-analytics', label: 'Churn Analytics', icon: BarChart3 },
    { id: 'model-performance', label: 'Model Performance', icon: Cpu },
    { id: 'explainability', label: 'Explainability', icon: Sparkles },
    { id: 'batch-scoring', label: 'Batch Scoring', icon: UploadCloud },
    { id: 'data-quality', label: 'Data Quality', icon: Database },
    { id: 'model-management', label: 'Model Management', icon: Settings2 },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-600/30">
              C
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none">
                CUSTOMER CHURN
              </h1>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Intelligence Platform
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400 leading-tight italic">
            Predict churn. Understand why. Retain customers.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Core Philosophy Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
          Core Engine Flow
        </div>
        <div className="text-[11px] font-medium text-slate-300 tracking-tight">
          Predict → Explain → Prioritize → Act → Learn
        </div>
      </div>
    </aside>
  );
};
