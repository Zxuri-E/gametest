import React from 'react';
import { Sparkles, Terminal, Lightbulb } from 'lucide-react';
import { Textarea } from '../../../components/ui/Textarea';

interface PromptEditorProps {
  prompt: string;
  onChange: (value: string) => void;
  onApplyExample: (example: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onChange,
  onApplyExample,
}) => {
  const examplePrompts = [
    {
      label: 'Cyberpunk Platformer',
      text: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
    },
    {
      label: 'Dungeon Rogue Crawler',
      text: 'A top-down torchlight rogue-lite dungeon crawler with directional slashing, roaming skeleton patrols, and locked exit portals.',
    },
    {
      label: 'Infinite Velocity Dash',
      text: 'An endless side-scroller runner where obstacle frequency accelerates exponentially and sliding under lasers is required.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Natural-Language Specification Prompt
        </label>
        <span className="text-xs font-mono text-slate-500">
          {prompt.length} chars
        </span>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Describe the 2D game rules, physics, player mechanics, enemies, and win/loss conditions..."
        className="font-mono text-xs leading-relaxed"
      />

      {/* Quick Example Prompt Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Presets:
        </span>
        {examplePrompts.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => onApplyExample(ex.text)}
            className="text-[11px] px-2.5 py-1 rounded bg-canvas-850 hover:bg-canvas-800 text-slate-300 border border-border-subtle hover:border-border-hover transition-colors font-mono"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
};

