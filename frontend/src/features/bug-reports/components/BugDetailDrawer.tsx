import React from 'react';
import { BugReport } from '@shared/core';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import {
  Bug,
  FileCode,
  Terminal,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface BugDetailModalProps {
  bug: BugReport | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BugReport['repairStatus']) => void;
  onTriggerRepair: (id: string) => void;
  isRepairing: boolean;
}

export const BugDetailModal: React.FC<BugDetailModalProps> = ({
  bug,
  onClose,
  onUpdateStatus,
  onTriggerRepair,
  isRepairing,
}) => {
  if (!bug) return null;

  return (
    <Modal
      isOpen={!!bug}
      onClose={onClose}
      title={bug.title}
      description={`ID: ${bug.id} • Project Version: v${bug.projectVersion}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <Select
              value={bug.repairStatus}
              onChange={(e) =>
                onUpdateStatus(bug.id, e.target.value as BugReport['repairStatus'])
              }
              options={[
                { value: 'open', label: 'Open' },
                { value: 'diagnosing', label: 'Diagnosing' },
                { value: 'patch-in-progress', label: 'Patch in Progress' },
                { value: 'verified-fixed', label: 'Verified Fixed' },
              ]}
              className="py-1 text-xs w-36"
            />
          </div>

          <div className="flex items-center gap-2">
            {bug.repairStatus !== 'verified-fixed' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Wrench className="w-4 h-4" />}
                isLoading={isRepairing}
                onClick={() => onTriggerRepair(bug.id)}
              >
                Trigger Auto-Repair Agent
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Meta Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded bg-canvas-950 border border-border-default text-xs font-mono">
          <span className="text-slate-400">Severity:</span>
          <Badge variant={bug.severity === 'critical' ? 'rose' : 'amber'} size="sm">
            {bug.severity.toUpperCase()}
          </Badge>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Category:</span>
          <Badge variant="indigo" size="sm">{bug.category.toUpperCase()}</Badge>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Mechanic:</span>
          <span className="text-cyan-300 font-semibold">{bug.affectedMechanic}</span>
        </div>

        {/* Expected vs Actual Behaviour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-canvas-950 border border-border-subtle space-y-1">
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] block font-mono">
              Expected Nominal Behaviour
            </span>
            <p className="text-slate-300 leading-relaxed">{bug.expectedBehaviour}</p>
          </div>

          <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40 space-y-1">
            <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px] block font-mono">
              Actual Observed Defect
            </span>
            <p className="text-slate-300 leading-relaxed">{bug.actualBehaviour}</p>
          </div>
        </div>

        {/* Suspected Source Location */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Suspected Source Location
            </span>
            <span className="text-cyan-400">
              {bug.suspectedSourceLocation.file} : Line {bug.suspectedSourceLocation.line}
            </span>
          </div>
          {bug.suspectedSourceLocation.snippet && (
            <div className="p-3 rounded bg-canvas-950 border border-border-default font-mono text-xs text-amber-300 overflow-x-auto">
              <code>{bug.suspectedSourceLocation.snippet}</code>
            </div>
          )}
        </div>

        {/* Diagnostic Evidence & Logs */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
            Diagnostic Telemetry & Evidence
          </span>
          <div className="p-3 rounded bg-canvas-950 border border-border-subtle font-mono text-[11px] space-y-1.5">
            {bug.evidence.failedAssertion && (
              <p className="text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{bug.evidence.failedAssertion}</span>
              </p>
            )}
            {bug.evidence.consoleLogs?.map((log, i) => (
              <p key={i} className="text-slate-400">
                {log}
              </p>
            ))}
            {bug.evidence.traceUrl && (
              <p className="text-cyan-400 text-[10px] pt-1">
                Artifact Trace: <code className="text-slate-300">{bug.evidence.traceUrl}</code>
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

