import React from 'react';
import { GameProject } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { GitBranch, Calendar, Monitor, Cpu } from 'lucide-react';

interface GameMetadataCardProps {
  project: GameProject | null;
}

export const GameMetadataCard: React.FC<GameMetadataCardProps> = ({ project }) => {
  if (!project) return null;

  return (
    <Card className="bg-canvas-900 border-border-default">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white">{project.name}</h2>
            <Badge variant="cyan" size="sm">v{project.currentVersion}</Badge>
            <Badge variant="slate" size="sm">{project.genre.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-500">Dimensions</span>
            <span className="text-slate-200">{project.specification.dimensions.width}×{project.specification.dimensions.height}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-500">Engine Core</span>
            <span className="text-cyan-400">Phaser 3.80</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-500">Test Matrix</span>
            <span className="text-emerald-400">{project.testsPassed} Passed</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

