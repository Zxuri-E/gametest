import React from 'react';
import { Card } from '../../../components/ui/Card';
import { GitCommit, Wrench, FileCode } from 'lucide-react';
import { RepairIteration } from '@shared/core';

interface VersionDiffViewerProps {
  repairIterations: RepairIteration[];
  selectedVersion: string;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  repairIterations,
  selectedVersion,
}) => {
  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Autonomous Repair & AST Patch Diff
          </h3>
        </div>
      }
    >
      <div className="space-y-4">
        {repairIterations.length === 0 ? (
          <p className="text-xs text-slate-400">No repair patches recorded for this project.</p>
        ) : (
          repairIterations.map((rep) => (
            <div key={rep.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 font-semibold">{rep.description}</span>
                <span className="text-emerald-400 font-semibold">
                  {rep.isSuccessful ? 'VERIFIED PASSED' : 'REVERTED'}
                </span>
              </div>
              <pre className="p-3 rounded bg-canvas-950 border border-border-default font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                {rep.diffPatch}
              </pre>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

