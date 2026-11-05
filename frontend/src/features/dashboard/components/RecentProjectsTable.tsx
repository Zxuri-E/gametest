import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Gamepad2 } from 'lucide-react';
import { GameProject } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface RecentProjectsTableProps {
  projects: GameProject[];
  onSelectProject: (id: string) => void;
}

export const RecentProjectsTable: React.FC<RecentProjectsTableProps> = ({
  projects,
  onSelectProject,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: GameProject['status']) => {
    switch (status) {
      case 'verified':
        return <Badge variant="emerald" size="sm" dot>VERIFIED</Badge>;
      case 'testing':
        return <Badge variant="amber" size="sm" dot>TESTING</Badge>;
      case 'ready':
        return <Badge variant="cyan" size="sm" dot>READY</Badge>;
      default:
        return <Badge variant="slate" size="sm">DRAFT</Badge>;
    }
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">Recent Projects</h3>
          </div>
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/history')}
          >
            View All
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-5 -my-5">
        <table className="w-full text-left text-xs">
          <thead className="bg-canvas-950/60 border-b border-border-subtle text-slate-400 font-mono uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-5">Project Name</th>
              <th className="py-2.5 px-4">Genre</th>
              <th className="py-2.5 px-4">Version</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Tests Passed</th>
              <th className="py-2.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {projects.map((proj) => (
              <tr
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj.id);
                  navigate('/workspace');
                }}
                className="hover:bg-canvas-850/50 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-5 font-medium text-slate-200 group-hover:text-cyan-400">
                  <div className="flex flex-col">
                    <span>{proj.name}</span>
                    <span className="text-[11px] text-slate-500 truncate max-w-xs">{proj.description}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono">{proj.genre}</td>
                <td className="py-3 px-4 font-mono text-cyan-300">v{proj.currentVersion}</td>
                <td className="py-3 px-4">{getStatusBadge(proj.status)}</td>
                <td className="py-3 px-4 font-mono">
                  <span className="text-emerald-400">{proj.testsPassed}</span>
                  <span className="text-slate-500"> / {proj.testsPassed + proj.testsFailed}</span>
                </td>
                <td className="py-3 px-5 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

