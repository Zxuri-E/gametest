import React from 'react';
import { BugReport } from '@shared/core';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Eye, Wrench, FileCode, CheckCircle2 } from 'lucide-react';

interface BugReportsTableProps {
  bugs: BugReport[];
  onSelectBug: (bug: BugReport) => void;
  onTriggerRepair: (bugId: string) => void;
}

export const BugReportsTable: React.FC<BugReportsTableProps> = ({
  bugs,
  onSelectBug,
  onTriggerRepair,
}) => {
  const getSeverityBadge = (severity: BugReport['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="rose" size="sm">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="amber" size="sm">HIGH</Badge>;
      case 'medium':
        return <Badge variant="indigo" size="sm">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="slate" size="sm">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: BugReport['repairStatus']) => {
    switch (status) {
      case 'verified-fixed':
        return <Badge variant="emerald" size="sm" dot>FIXED</Badge>;
      case 'patch-in-progress':
        return <Badge variant="cyan" size="sm" dot>PATCHING</Badge>;
      case 'diagnosing':
        return <Badge variant="amber" size="sm" dot>DIAGNOSING</Badge>;
      case 'open':
        return <Badge variant="rose" size="sm" dot>OPEN</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="p-12 text-center rounded-lg bg-canvas-900 border border-border-default text-slate-400">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-200">No matching bug reports found</p>
        <p className="text-xs text-slate-500 mt-1">All mechanics are functioning within nominal parameters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-canvas-900 border border-border-default shadow-panel">
      <table className="w-full text-left text-xs">
        <thead className="bg-canvas-950/80 border-b border-border-subtle text-slate-400 font-mono uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Issue Title & Description</th>
            <th className="py-3 px-3">Category</th>
            <th className="py-3 px-3">Mechanic</th>
            <th className="py-3 px-4">Suspected Source</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {bugs.map((bug) => (
            <tr
              key={bug.id}
              onClick={() => onSelectBug(bug)}
              className="hover:bg-canvas-850/60 cursor-pointer transition-colors group"
            >
              <td className="py-3.5 px-4 shrink-0">{getSeverityBadge(bug.severity)}</td>
              <td className="py-3.5 px-4 min-w-[280px]">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {bug.title}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {bug.actualBehaviour}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-3 font-mono text-slate-300 capitalize">{bug.category}</td>
              <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">{bug.affectedMechanic}</td>
              <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300">
                <div className="flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate max-w-[160px]">
                    {bug.suspectedSourceLocation.file}:{bug.suspectedSourceLocation.line}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-3">{getStatusBadge(bug.repairStatus)}</td>
              <td className="py-3.5 px-4 text-right shrink-0">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {bug.repairStatus === 'open' && (
                    <Button
                      variant="primary"
                      size="xs"
                      leftIcon={<Wrench className="w-3 h-3" />}
                      onClick={() => onTriggerRepair(bug.id)}
                    >
                      Auto-Repair
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Eye className="w-3 h-3" />}
                    onClick={() => onSelectBug(bug)}
                  >
                    Inspect
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

