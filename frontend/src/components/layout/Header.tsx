import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  RotateCw,
  FolderGit2,
  Server,
  Activity,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useTestingStore } from '../../store/useTestingStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { projects, activeProject, selectProject } = useProjectStore();
  const { runAllTests, isRunningTests } = useTestingStore();

  const statusVariant = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'emerald';
      case 'testing':
        return 'amber';
      case 'error':
        return 'rose';
      case 'generating':
        return 'cyan';
      default:
        return 'slate';
    }
  };

  return (
    <header className="h-14 px-6 bg-canvas-900 border-b border-border-default flex items-center justify-between shrink-0 z-20">
      {/* Left: Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-slate-400" />
          <select
            value={activeProject?.id || ''}
            onChange={(e) => selectProject(e.target.value)}
            className="bg-canvas-800 border border-border-default rounded text-xs font-medium text-slate-100 py-1.5 px-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-canvas-900">
                {p.name} (v{p.currentVersion})
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <Badge variant={statusVariant(activeProject.status)} size="sm" dot>
            {activeProject.status.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Right: Runtime Indicator & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Mock Mode Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-canvas-800/80 border border-border-subtle">
          <Server className="w-3 h-3 text-cyan-400" />
          <span>RUNTIME:</span>
          <span className="text-cyan-300 font-semibold">STANDALONE MOCK</span>
        </div>

        {/* Quick Test Execution Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />}
          onClick={() => {
            navigate('/testing');
            runAllTests();
          }}
          disabled={isRunningTests}
        >
          {isRunningTests ? 'Verifying...' : 'Run Verification'}
        </Button>

        {/* Studio Generate Shortcut Button */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => navigate('/studio')}
        >
          Generate Game
        </Button>
      </div>
    </header>
  );
};

