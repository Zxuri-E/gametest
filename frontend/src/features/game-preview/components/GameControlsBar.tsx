import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
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
    toggleHitboxes,
    toggleVectors,
    toggleGrid,
  } = useWorkspaceStore();

  const handleFullscreen = () => {
    const el = document.getElementById('phaser-mount-outer');
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && window.__NOVUS_ACTIVE_ADAPTER__) {
      window.__NOVUS_ACTIVE_ADAPTER__.restart();
    }
  };

  const handleNewWorld = () => {
    if (typeof window !== 'undefined' && window.__NOVUS_ACTIVE_ADAPTER__) {
      window.__NOVUS_ACTIVE_ADAPTER__.newWorld();
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
            onClick={() => {
              pauseGame();
              window.__NOVUS_ACTIVE_ADAPTER__?.pause();
            }}
          >
            Pause
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            onClick={() => {
              if (isPaused) {
                resumeGame();
                window.__NOVUS_ACTIVE_ADAPTER__?.resume();
              } else {
                startGame();
                window.__NOVUS_ACTIVE_ADAPTER__?.start();
              }
            }}
          >
            {isPaused ? 'Resume' : 'Start Game'}
          </Button>
        )}

        {/* Restart (Same Seed) */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4 text-cyan-400" />}
          onClick={handleRestart}
          title="Replay the current level with the exact same seed"
        >
          Restart
        </Button>

        {/* New World (New Seed) */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
          onClick={handleNewWorld}
          title="Generate a completely fresh seeded layout"
        >
          New World
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
