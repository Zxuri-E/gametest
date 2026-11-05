import React from 'react';
import { GitCommit, Calendar, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface VersionItem {
  version: string;
  date: string;
  prompt: string;
  tests: { passed: number; failed: number };
  status: string;
  changes: string[];
}

interface VersionTimelineProps {
  versions: VersionItem[];
  selectedVersion: string;
  onSelectVersion: (v: string) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  selectedVersion,
  onSelectVersion,
}) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-default">
      {versions.map((ver) => {
        const isSelected = selectedVersion === ver.version;
        const total = ver.tests.passed + ver.tests.failed;
        return (
          <div
            key={ver.version}
            onClick={() => onSelectVersion(ver.version)}
            className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
              isSelected
                ? 'bg-canvas-850 border-cyan-400 shadow-panel'
                : 'bg-canvas-900 border-border-default hover:border-border-hover'
            }`}
          >
            {/* Timeline Circle */}
            <div
              className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-canvas-950 ${
                isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/20' : 'border-slate-500'
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-cyan-300">v{ver.version}</span>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ver.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ver.status === 'verified' ? 'emerald' : 'amber'} size="sm">
                  {ver.status.toUpperCase()}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {ver.tests.passed}/{total} Tests
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 font-mono bg-canvas-950 p-2.5 rounded border border-border-subtle">
              <span className="text-slate-500 block text-[10px] uppercase">Specification Prompt:</span>
              "{ver.prompt}"
            </p>

            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                Synthesized Architectural Changes:
              </span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {ver.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

