import React from 'react';
import { RepairIteration } from '@shared/core';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, Wrench, GitCommit } from 'lucide-react';

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
      title="Autonomous Repair Synthesis Applied"
      description={`Repair Iteration #${iteration.iterationNumber} • Generated AST Patch`}
      maxWidth="xl"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Accept Patch & Return
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Repair Agent generated and verified a non-breaking AST code patch. Automated verification test suite re-run passed!
          </span>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
            Generated Unified Diff Patch
          </span>
          <pre className="p-3.5 rounded bg-canvas-950 border border-border-default font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
            {iteration.diffPatch}
          </pre>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Affected Files: <span className="text-slate-200">{iteration.affectedFiles.join(', ')}</span>
        </div>
      </div>
    </Modal>
  );
};

