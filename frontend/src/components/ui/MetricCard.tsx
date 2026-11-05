import React from 'react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  trend,
  accentColor = 'cyan',
  className,
}) => {
  const accentBorders = {
    cyan: 'border-l-cyan-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    indigo: 'border-l-indigo-500',
  };

  const accentIcons = {
    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/40',
    emerald: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40',
    amber: 'text-amber-400 bg-amber-950/50 border-amber-800/40',
    rose: 'text-rose-400 bg-rose-950/50 border-rose-800/40',
    indigo: 'text-indigo-400 bg-indigo-950/50 border-indigo-800/40',
  };

  return (
    <div
      className={cn(
        'bg-canvas-900 border border-border-default rounded-lg p-4 border-l-4 transition-all duration-150 hover:border-border-hover',
        accentBorders[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {icon && (
          <div className={cn('p-2 rounded-md border text-sm', accentIcons[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {subValue && <span className="text-xs text-slate-400 font-normal">{subValue}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-mono font-medium',
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-500">vs last version</span>
        </div>
      )}
    </div>
  );
};

