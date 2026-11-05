import React from 'react';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const TestExecutionHistory: React.FC = () => {
  const historyRuns = [
    {
      id: 'run-nov05-1422',
      version: 'v0.3.0',
      time: 'Today at 14:22',
      passed: 7,
      failed: 1,
      duration: '3.47s',
      status: 'failed',
    },
    {
      id: 'run-nov04-1640',
      version: 'v0.2.0',
      time: 'Yesterday at 16:40',
      passed: 6,
      failed: 0,
      duration: '2.81s',
      status: 'passed',
    },
    {
      id: 'run-nov04-1030',
      version: 'v0.1.0',
      time: 'Nov 4 at 10:30',
      passed: 3,
      failed: 1,
      duration: '1.95s',
      status: 'failed',
    },
  ];

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Test Execution History
          </h3>
        </div>
      }
    >
      <div className="space-y-2 text-xs font-mono">
        {historyRuns.map((run) => (
          <div
            key={run.id}
            className="p-2.5 rounded bg-canvas-950 border border-border-subtle flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{run.version}</span>
                <span className="text-[10px] text-slate-500 font-sans">{run.time}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">Run ID: {run.id}</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                {run.status === 'passed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className={run.status === 'passed' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {run.passed}/{run.passed + run.failed}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">{run.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

