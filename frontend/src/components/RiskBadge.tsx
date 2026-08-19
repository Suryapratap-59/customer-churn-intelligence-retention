import React from 'react';
import type { RiskLevel, PriorityLabel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel | PriorityLabel | string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const upper = level?.toString().toUpperCase() || 'LOW';

  let colorClasses = 'bg-slate-700/50 text-slate-300 border-slate-600';
  
  if (upper === 'LOW') {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
  } else if (upper === 'MEDIUM') {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
  } else if (upper === 'HIGH') {
    colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
  } else if (upper === 'CRITICAL') {
    colorClasses = 'bg-purple-950/60 text-purple-300 border-purple-800/60 font-bold animate-pulse';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md border',
    lg: 'px-3.5 py-1.5 text-sm font-semibold rounded-md border',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        upper === 'LOW' ? 'bg-emerald-400' :
        upper === 'MEDIUM' ? 'bg-amber-400' :
        upper === 'HIGH' ? 'bg-rose-400' : 'bg-purple-400'
      }`} />
      {upper}
    </span>
  );
};
