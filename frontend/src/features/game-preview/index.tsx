import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { GameCanvasPlaceholder } from './components/GameCanvasPlaceholder';
import { GameControlsBar } from './components/GameControlsBar';
import { GameInspectorPanel } from './components/GameInspectorPanel';
import { GameMetadataCard } from './components/GameMetadataCard';
import { useProjectStore } from '../../store/useProjectStore';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GameWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeSpec, updateActiveSpec } = useProjectStore();

  return (
    <PageContainer
      title="Game Workspace & Runtime Inspector"
      subtitle="Interactive 2D canvas execution environment, physics telemetry inspector, and Phaser engine host."
      action={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          onClick={() => navigate('/testing')}
        >
          Verify in Testing Center
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Project Header Information */}
        <GameMetadataCard project={activeProject} />

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Game Canvas & Playback Bar */}
          <div className="lg:col-span-2 space-y-3">
            <GameCanvasPlaceholder spec={activeSpec} />
            <GameControlsBar />

            {/* Interaction Keyboard Instructions Bar */}
            <div className="p-3 rounded-lg bg-canvas-900 border border-border-default flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Interactive Controls:</span>
              </span>
              <div className="flex items-center gap-3">
                <span>Move: <strong className="text-slate-200">A / D / ← / →</strong></span>
                <span>Jump: <strong className="text-slate-200">W / Space / ↑</strong></span>
                <span className="text-slate-500">(Auto-patrols when idle)</span>
              </div>
            </div>
          </div>

          {/* Right Col: Telemetry & Live Inspector */}
          <div>
            <GameInspectorPanel
              spec={activeSpec}
              onUpdateSpec={updateActiveSpec}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

