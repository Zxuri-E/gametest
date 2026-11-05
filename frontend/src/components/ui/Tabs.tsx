import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        variant === 'underline' && 'border-b border-border-subtle',
        variant === 'pills' && 'bg-canvas-950 p-1 rounded-lg border border-border-default',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 text-xs font-medium transition-colors select-none',
              variant === 'underline' &&
                'px-4 py-2.5 -mb-px border-b-2',
              variant === 'underline' &&
                (isActive
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-border-hover'),
              variant === 'pills' &&
                'px-3 py-1.5 rounded-md',
              variant === 'pills' &&
                (isActive
                  ? 'bg-canvas-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200')
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                    : 'bg-canvas-800 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

