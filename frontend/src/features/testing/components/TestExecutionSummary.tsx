import React from 'react';
import { CheckCircle2, XCircle, RotateCw, ListChecks, Play } from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Button } from '../../../components/ui/Button';

interface TestExecutionSummaryProps {
  total: number;
  passed: number;
  failed: number;
  running: number;
  isRunning: boolean;
  onRunAll: () => void;
}

export const TestExecutionSummary: React.FC<TestExecutionSummaryProps> = ({
  total,
  passed,
  failed,
  running,
  isRunning,
  onRunAll,
}) => {
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Header Runner Bar */}
      <div className="p-4 rounded-lg bg-canvas-900 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Automated Playwright Test Harness</h2>
            <span className="text-[10px] font-mono uppercase bg-canvas-800 text-cyan-400 border border-border-subtle px-1.5 py-0.5 rounded">
              Headless Chromium
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes programmatic input actions, evaluates state matrix assertions, and records physics telemetry.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />}
          isLoading={isRunning}
          onClick={onRunAll}
          className="shrink-0"
        >
          {isRunning ? 'Executing Automated Suite...' : 'Run All Verification Tests'}
        </Button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Test Cases"
          value={total}
          icon={<ListChecks className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Passed Tests"
          value={passed}
          subValue={`${passRate}% passing`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Failed Assertions"
          value={failed}
          subValue="requires repair"
          icon={<XCircle className="w-4 h-4" />}
          accentColor="rose"
        />
        <MetricCard
          title="Active Workers"
          value={isRunning ? `${running || 2} Running` : 'Idle'}
          subValue="Playwright bot"
          icon={<RotateCw className="w-4 h-4" />}
          accentColor="amber"
        />
      </div>
    </div>
  );
};

