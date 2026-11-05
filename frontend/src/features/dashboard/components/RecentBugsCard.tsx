import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, ArrowRight, AlertTriangle } from 'lucide-react';
import { BugReport } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface RecentBugsCardProps {
  bugs: BugReport[];
}

export const RecentBugsCard: React.FC<RecentBugsCardProps> = ({ bugs }) => {
  const navigate = useNavigate();

  const getSeverityBadge = (sev: BugReport['severity']) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="rose" size="sm">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="amber" size="sm">HIGH</Badge>;
      default:
        return <Badge variant="slate" size="sm">{sev.toUpperCase()}</Badge>;
    }
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-slate-100">Active Bug Reports</h3>
          </div>
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/bugs')}
          >
            Review All
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {bugs.slice(0, 3).map((bug) => (
          <div
            key={bug.id}
            onClick={() => navigate('/bugs')}
            className="p-3 rounded bg-canvas-850/50 border border-border-subtle hover:border-border-hover cursor-pointer transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                {bug.title}
              </span>
              {getSeverityBadge(bug.severity)}
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {bug.actualBehaviour}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>{bug.suspectedSourceLocation.file}:{bug.suspectedSourceLocation.line}</span>
              <span className="text-cyan-400">{bug.repairStatus.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

