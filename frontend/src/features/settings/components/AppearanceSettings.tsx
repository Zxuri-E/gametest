import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { Palette } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const { appearance, updateAppearance } = useSettingsStore();

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Interface & Developer Theme</h3>
        </div>
      }
    >
      <div className="space-y-4 max-w-xl">
        <Select
          label="UI Element Density"
          value={appearance.uiDensity}
          onChange={(e) => updateAppearance({ uiDensity: e.target.value as any })}
          options={[
            { value: 'comfortable', label: 'Comfortable (Standard developer spacing)' },
            { value: 'compact', label: 'Compact (High information density)' },
          ]}
        />

        <Select
          label="Primary Accent Palette"
          value={appearance.accentColor}
          onChange={(e) => updateAppearance({ accentColor: e.target.value as any })}
          options={[
            { value: 'cyan', label: 'Cyan Cyberpunk (#06b6d4) - Default' },
            { value: 'indigo', label: 'Deep Indigo (#6366f1)' },
            { value: 'emerald', label: 'Matrix Emerald (#10b981)' },
          ]}
        />

        <div className="flex items-center justify-between p-3 rounded bg-canvas-950 border border-border-subtle">
          <div>
            <label className="text-xs font-semibold text-slate-200 block">Canvas Grid Alignment Guides</label>
            <p className="text-[11px] text-slate-400">Render 40px grid overlay on the game workspace preview</p>
          </div>
          <input
            type="checkbox"
            checked={appearance.showGridGuides}
            onChange={(e) => updateAppearance({ showGridGuides: e.target.checked })}
            className="w-4 h-4 rounded border-border-default bg-canvas-850 text-cyan-500 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
};
