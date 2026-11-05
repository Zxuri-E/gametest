import React from 'react';
import { TestCase } from '@shared/core';
import { CheckCircle2, XCircle, RotateCw, Eye, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface TestCaseListProps {
  testCases: TestCase[];
  onSelectTest: (test: TestCase) => void;
  filterMechanic: string;
}

export const TestCaseList: React.FC<TestCaseListProps> = ({
  testCases,
  onSelectTest,
  filterMechanic,
}) => {
  const filtered = filterMechanic === 'all'
    ? testCases
    : testCases.filter((t) => t.mechanic === filterMechanic);

  const getStatusDisplay = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="emerald" size="sm" dot>PASSED</Badge>;
      case 'failed':
        return <Badge variant="rose" size="sm" dot>FAILED</Badge>;
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono animate-pulse">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            RUNNING
          </span>
        );
      default:
        return <Badge variant="slate" size="sm">QUEUED</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {filtered.map((test) => {
        const isFailed = test.status === 'failed';
        return (
          <div
            key={test.id}
            onClick={() => onSelectTest(test)}
            className={`p-4 rounded-lg bg-canvas-900 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isFailed
                ? 'border-rose-900/60 hover:border-rose-700 bg-rose-950/10'
                : 'border-border-default hover:border-border-hover'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="pt-0.5 shrink-0">
                {test.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : test.status === 'failed' ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">{test.name}</h4>
                  <span className="text-[10px] font-mono uppercase bg-canvas-800 text-slate-400 px-1.5 py-0.2 rounded border border-border-subtle">
                    {test.mechanic}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{test.description}</p>
                {test.errorMessage && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{test.errorMessage}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-border-subtle pt-2 sm:pt-0">
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-400">{test.assertions.length} assertions</span>
                {test.durationMs && (
                  <span className="text-slate-500 block text-[10px]">{test.durationMs}ms</span>
                )}
              </div>
              <div className="w-24 text-right">{getStatusDisplay(test.status)}</div>
              <Button variant="ghost" size="xs" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Details
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

