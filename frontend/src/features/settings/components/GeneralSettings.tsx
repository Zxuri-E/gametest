import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { Sliders } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const { general, updateGeneral } = useSettingsStore();

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">General Workspace Preferences</h3>
        </div>
      }
    >
      <div className="space-y-4 max-w-xl">
        <Input
          label="Default Project Workspace Name"
          value={general.projectName}
          onChange={(e) => updateGeneral({ projectName: e.target.value })}
        />

        <div className="flex items-center justify-between p-3 rounded bg-canvas-950 border border-border-subtle">
          <div>
            <label className="text-xs font-semibold text-slate-200 block">Auto-Save Game Specifications</label>
            <p className="text-[11px] text-slate-400">Automatically sync specification changes to disk</p>
          </div>
          <input
            type="checkbox"
            checked={general.autoSave}
            onChange={(e) => updateGeneral({ autoSave: e.target.checked })}
            className="w-4 h-4 rounded border-border-default bg-canvas-850 text-cyan-500 accent-cyan-400 cursor-pointer"
          />
        </div>

        <Select
          label="Telemetry & Engine Log Verbosity"
          value={general.telemetryVerbosity}
          onChange={(e) => updateGeneral({ telemetryVerbosity: e.target.value as any })}
          options={[
            { value: 'minimal', label: 'Minimal (Errors & Warnings only)' },
            { value: 'normal', label: 'Normal (State changes & Assertions)' },
            { value: 'verbose', label: 'Verbose (Full 60FPS physics step dumps)' },
          ]}
        />
      </div>
    </Card>
  );
};
