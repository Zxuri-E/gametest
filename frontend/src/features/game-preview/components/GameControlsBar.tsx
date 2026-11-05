import React from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize2,
  Crosshair,
  Layers,
  Grid,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { cn } from '../../../utils/cn';

export const GameControlsBar: React.FC = () => {
  const {
    isRunning,
    isPaused,
    showHitboxes,
    showVectors,
    showGrid,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    resetGame,
    toggleHitboxes,
    toggleVectors,
    toggleGrid,
  } = useWorkspaceStore();

  const handleFullscreen = () => {
    const el = document.getElementById('phaser-mount-container');
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-canvas-900 border border-border-default">
      {/* Primary Playback Controls */}
      <div className="flex items-center gap-2">
        {isRunning && !isPaused ? (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Pause className="w-4 h-4 text-amber-400" />}
            onClick={pauseGame}
          >
            Pause
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            onClick={isRunning ? resumeGame : startGame}
          >
            {isPaused ? 'Resume' : 'Run Engine'}
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Square className="w-4 h-4 text-rose-400" />}
          onClick={stopGame}
          disabled={!isRunning}
        >
          Stop
        </Button>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4 text-cyan-400" />}
          onClick={resetGame}
        >
          Reset Scene
        </Button>
      </div>

      {/* Debug & Overlay Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleHitboxes}
          title="Toggle AABB Hitbox Wireframes"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-colors',
            showHitboxes
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-canvas-850 text-slate-400 border-border-subtle hover:text-slate-200'
          )}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Hitboxes</span>
        </button>

        <button
          onClick={toggleVectors}
          title="Toggle Physics Velocity Vectors"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-colors',
            showVectors
              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
              : 'bg-canvas-850 text-slate-400 border-border-subtle hover:text-slate-200'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Vectors</span>
        </button>

        <button
          onClick={toggleGrid}
          title="Toggle Spatial Grid Coordinate Lines"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-colors',
            showGrid
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
              : 'bg-canvas-850 text-slate-400 border-border-subtle hover:text-slate-200'
          )}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        <div className="h-5 w-px bg-border-subtle mx-1" />

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
          onClick={handleFullscreen}
        >
          Fullscreen
        </Button>
      </div>
    </div>
  );
};
