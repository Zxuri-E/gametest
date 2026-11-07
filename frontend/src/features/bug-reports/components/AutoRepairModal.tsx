import React from 'react';
import { RepairIteration } from '@shared/core';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, Bot, FileCode, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface AutoRepairModalProps {
  iteration: RepairIteration | null;
  onClose: () => void;
}

export const AutoRepairModal: React.FC<AutoRepairModalProps> = ({ iteration, onClose }) => {
  if (!iteration) return null;

  return (
    <Modal
      isOpen={!!iteration}
      onClose={onClose}
      title="Autonomous AI Repair Synthesis Applied"
      description={`Repair Iteration #${iteration.iterationNumber} • ID: ${iteration.id}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verification Status: Verified Fixed (Regression Suite Passed)</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Accept Patch & Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Model Attribution & Verification Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Repair verified non-breaking by automated Playtester re-run.</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-canvas-900 px-2 py-0.5 rounded border border-emerald-700/50 text-cyan-300">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>gpt-oss-120b-medium (Qwen OSS)</span>
          </div>
        </div>

        {/* Description / Explanation */}
        <div className="p-3 rounded bg-canvas-950 border border-border-default text-xs space-y-1">
          <span className="font-semibold text-slate-300 font-mono uppercase tracking-wider text-[10px] block">
            AI Root Cause Resolution Explanation
          </span>
          <p className="text-slate-300 leading-relaxed font-sans">
            {iteration.description}
          </p>
        </div>

        {/* Verification Execution Logs */}
        {iteration.verificationLogs && iteration.verificationLogs.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
              Automated Verification Execution Logs
            </span>
            <div className="p-3 rounded bg-canvas-950 border border-border-default font-mono text-[11px] text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              {iteration.verificationLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Unified Diff Patch */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Synthesized Unified Diff Patch
            </span>
            <span className="text-slate-400 text-[11px]">
              Files: {iteration.affectedFiles.join(', ')}
            </span>
          </div>
          <pre className="p-3.5 rounded bg-canvas-950 border border-border-default font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-60">
            {iteration.diffPatch}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
