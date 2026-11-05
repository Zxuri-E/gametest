import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Slider } from '../../../components/ui/Slider';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { CheckCircle2, Shield } from 'lucide-react';

export const TestingSettings: React.FC = () => {
  const { testing, updateTesting } = useSettingsStore();

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Playwright Automated Testing Engine</h3>
        </div>
      }
    >
      <div className="space-y-4 max-w-xl">
        <div className="flex items-center justify-between p-3 rounded bg-canvas-950 border border-border-subtle">
          <div>
            <label className="text-xs font-semibold text-slate-200 block">Headless Browser Execution</label>
            <p className="text-[11px] text-slate-400">Run tests without opening visible browser windows</p>
          </div>
          <input
            type="checkbox"
            checked={testing.headless}
            onChange={(e) => updateTesting({ headless: e.target.checked })}
            className="w-4 h-4 rounded border-border-default bg-canvas-850 text-cyan-500 accent-cyan-400 cursor-pointer"
          />
        </div>

        <Slider
          label="Concurrent Test Worker Threads"
          valueDisplay={`${testing.workers} workers`}
          min={1}
          max={8}
          step={1}
          value={testing.workers}
          onChange={(e) => updateTesting({ workers: Number(e.target.value) })}
        />

        <Slider
          label="Assertion Timeout Threshold"
          valueDisplay={`${testing.timeoutSeconds}s`}
          min={5}
          max={60}
          step={5}
          value={testing.timeoutSeconds}
          onChange={(e) => updateTesting({ timeoutSeconds: Number(e.target.value) })}
        />

        <div className="flex items-center justify-between p-3 rounded bg-canvas-950 border border-border-subtle">
          <div>
            <label className="text-xs font-semibold text-slate-200 block">Capture Screenshot on Assertion Failure</label>
            <p className="text-[11px] text-slate-400">Stores canvas render snapshot inside test evidence artifact</p>
          </div>
          <input
            type="checkbox"
            checked={testing.captureScreenshotOnFail}
            onChange={(e) => updateTesting({ captureScreenshotOnFail: e.target.checked })}
            className="w-4 h-4 rounded border-border-default bg-canvas-850 text-cyan-500 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
};
