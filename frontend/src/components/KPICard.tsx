import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  icon: Icon,
  iconColor = 'text-indigo-400 bg-indigo-950/50 border-indigo-800/60'
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
