import React from 'react';
import { Activity, Bot, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const LiveActivityFeed: React.FC = () => {
  const events = [
    {
      id: 'e1',
      agent: 'Diagnostician Agent',
      icon: Cpu,
      color: 'text-amber-400',
      action: 'Isolated unpurged cache in ShardManager.ts:42',
      time: '2 mins ago',
    },
    {
      id: 'e2',
      agent: 'Playtester Bot',
      icon: Bot,
      color: 'text-cyan-400',
      action: 'Completed headless Playwright run for run-nov05-1422 (8 tests)',
      time: '6 mins ago',
    },
    {
      id: 'e3',
      agent: 'Test Planner',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      action: 'Generated 8 assertion scenarios for Neon Vault Runner v0.3.0',
      time: '12 mins ago',
    },
    {
      id: 'e4',
      agent: 'Repair Agent',
      icon: Wrench,
      color: 'text-indigo-400',
      action: 'Successfully generated diff patch #rep-01 for camera lerp jitter',
      time: '1 hour ago',
    },
  ];

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Live Agent Activity Log</h3>
        </div>
      }
    >
      <div className="space-y-3 font-mono text-xs">
        {events.map((e) => {
          const Icon = e.icon;
          return (
            <div
              key={e.id}
              className="flex items-start gap-3 p-2.5 rounded bg-canvas-950/60 border border-border-subtle"
            >
              <div className={`p-1.5 rounded bg-canvas-850 shrink-0 ${e.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">{e.agent}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{e.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{e.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

