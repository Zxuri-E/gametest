import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSpecification, GameLifecycleState } from '@shared/core';
import { PhaserRuntimeAdapter } from '@game-engine/runtime';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/Button';
import {
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertTriangle,
  Flame,
  ArrowRight,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface PhaserGameViewProps {
  spec: GameSpecification | null;
  onStateChange?: (state: GameLifecycleState) => void;
}

export const PhaserGameView: React.FC<PhaserGameViewProps> = ({ spec, onStateChange }) => {
  const navigate = useNavigate();
  const phaserHostRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<PhaserRuntimeAdapter | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [lifecycleState, setLifecycleState] = useState<GameLifecycleState>('INITIALIZING');
  const [currentScore, setCurrentScore] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    isRunning,
    isPaused,
    showHitboxes,
    showVectors,
    showGrid,
    updateTelemetry,
    startGame,
    stopGame,
  } = useWorkspaceStore();

  const handleLifecycleTransition = (newState: GameLifecycleState) => {
    setLifecycleState(newState);
    onStateChange?.(newState);
    if (newState === 'PLAYING') {
      startGame();
    } else if (newState === 'GAME_OVER' || newState === 'VICTORY' || newState === 'PAUSED') {
      stopGame();
    }
  };

  // Mount & Update Phaser Game Engine
  useEffect(() => {
    const host = phaserHostRef.current;
    if (!host || !spec) return;

    let isCancelled = false;
    let adapter: PhaserRuntimeAdapter | null = new PhaserRuntimeAdapter();
    adapterRef.current = adapter;
    setMountError(null);
    setIsMounted(false);
    handleLifecycleTransition('INITIALIZING');

    adapter
      .mount(host, spec)
      .then(() => {
        if (isCancelled) {
          adapter?.unmount();
          adapter = null;
          if (adapterRef.current === adapter) {
            adapterRef.current = null;
          }
        } else {
          setIsMounted(true);
          handleLifecycleTransition('READY');
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          console.error('[PhaserGameView] Error mounting Phaser:', err);
          setMountError(err.message || 'Failed to initialize Phaser 3 arcade runtime');
          handleLifecycleTransition('ERROR');
        }
      });

    // Telemetry and Lifecycle Polling Loop from real Phaser runtime
    const telemetryInterval = setInterval(async () => {
      const activeAdapter = adapterRef.current;
      if (activeAdapter && !isCancelled) {
        try {
          const testApi = activeAdapter.getTestAPI();
          const state = await testApi.getGameState();

          setCurrentScore(state.score);
          setElapsedTime(state.elapsedTimeMs);
          if (state.distanceTraveled) {
            setCurrentDistance(Math.round(state.distanceTraveled));
          }

          if (state.isGameOver && lifecycleState !== 'GAME_OVER') {
            handleLifecycleTransition('GAME_OVER');
          } else if (state.isVictory && lifecycleState !== 'VICTORY') {
            handleLifecycleTransition('VICTORY');
          }

          updateTelemetry({
            fps: state.fps || 60,
            score: state.score,
            lives: state.lives,
            entitiesCount: state.entitiesCount,
            elapsedTimeMs: state.elapsedTimeMs,
            playerPos: {
              x: state.player.x,
              y: state.player.y,
              vx: state.player.velocityX,
              vy: state.player.velocityY,
            },
          });
        } catch {
          // Engine may be transitioning scenes
        }
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearInterval(telemetryInterval);
      setIsMounted(false);
      if (adapter) {
        adapter.unmount();
        adapter = null;
      }
      adapterRef.current = null;
    };
  }, [spec?.id, spec?.genre, spec?.seed]);

  // Handle Playback State changes (Pause, Resume)
  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter) return;

    if (isPaused) {
      adapter.pause();
      if (lifecycleState === 'PLAYING') handleLifecycleTransition('PAUSED');
    } else if (isRunning && lifecycleState === 'PAUSED') {
      adapter.resume();
      handleLifecycleTransition('PLAYING');
    }
  }, [isRunning, isPaused]);

  // Handle Debug Overlay changes (Hitboxes, Vectors, Grid)
  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter) return;

    adapter.setDebugOverlays({
      hitboxes: showHitboxes,
      vectors: showVectors,
      grid: showGrid,
    });
  }, [showHitboxes, showVectors, showGrid]);

  const handleStartGame = () => {
    const adapter = adapterRef.current;
    if (adapter) {
      adapter.start();
      handleLifecycleTransition('PLAYING');
    }
  };

  const handleRestart = () => {
    const adapter = adapterRef.current;
    if (adapter) {
      adapter.restart();
      handleLifecycleTransition('PLAYING');
    }
  };

  const handleNewWorld = () => {
    const adapter = adapterRef.current;
    if (adapter) {
      adapter.newWorld();
      handleLifecycleTransition('PLAYING');
    }
  };

  const handleNextLevel = () => {
    const adapter = adapterRef.current;
    if (adapter) {
      adapter.nextLevel();
      handleLifecycleTransition('PLAYING');
    }
  };

  return (
    <div
      id="phaser-mount-outer"
      className="relative w-full aspect-[4/3] max-h-[580px] bg-canvas-950 rounded-lg overflow-hidden border border-border-default shadow-2xl flex items-center justify-center select-none"
    >
      {/* 
        CRITICAL LIFECYCLE FIX (ADR-002):
        This inner div is strictly dedicated to hosting Phaser's Canvas.
        React renders ZERO children inside this host element.
        All UI overlays, loading spinners, state badges, and buttons are sibling elements.
        This completely eliminates React Node.removeChild / NotFoundError crashes.
      */}
      <div
        ref={phaserHostRef}
        id="phaser-canvas-host"
        className="w-full h-full flex items-center justify-center"
      />

      {/* Mounting Loading Spinner */}
      {!isMounted && !mountError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas-950/90 text-slate-400 font-mono text-xs z-10 backdrop-blur-sm">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-300">Initializing Phaser 3 Engine...</span>
          <span className="text-[11px] text-slate-500 font-sans">
            Genre: <strong className="text-cyan-400 uppercase">{spec?.genre}</strong> | Seed:{' '}
            <strong className="text-slate-400">{spec?.seed || 'default'}</strong>
          </span>
        </div>
      )}

      {/* Mount Error Fallback */}
      {mountError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-rose-950/95 text-rose-200 font-mono text-xs z-10 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
          <span className="font-semibold text-sm">Failed to Mount Game Engine</span>
          <span className="text-xs text-rose-300 max-w-md">{mountError}</span>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload Runtime
          </Button>
        </div>
      )}

      {/* READY State Overlay: Game is generated & loaded, waiting for user to click Start Game */}
      {isMounted && lifecycleState === 'READY' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-canvas-950/80 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-1.5 text-center px-4">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Runtime Ready
            </span>
            <h2 className="text-xl font-bold text-slate-100">{spec?.title}</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Press <strong className="text-cyan-300">Start Game</strong> or use keyboard controls to begin playing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleStartGame}
              className="shadow-lg shadow-cyan-500/25 px-6"
            >
              Start Game
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
              onClick={handleNewWorld}
            >
              New World
            </Button>
          </div>
        </div>
      )}

      {/* PAUSED State Overlay */}
      {isMounted && lifecycleState === 'PAUSED' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-canvas-950/85 backdrop-blur-sm z-20">
          <h2 className="text-2xl font-bold text-slate-100 tracking-wider">GAME PAUSED</h2>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => {
                adapterRef.current?.resume();
                handleLifecycleTransition('PLAYING');
              }}
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRestart}
            >
              Restart
            </Button>
          </div>
        </div>
      )}

      {/* GAME OVER State Overlay */}
      {isMounted && lifecycleState === 'GAME_OVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-canvas-950/90 backdrop-blur-md z-20 animate-fade-in p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-rose-400 tracking-wider">GAME OVER</h2>
            <p className="text-xs text-slate-400">The player was defeated. Choose an option to replay or advance.</p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 py-2 px-6 rounded-lg bg-canvas-900 border border-border-default text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Final Score</span>
              <strong className="text-emerald-400 text-sm">{currentScore}</strong>
            </div>
            {spec?.genre === 'endless-runner' && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Distance</span>
                <strong className="text-cyan-400 text-sm">{currentDistance}m</strong>
              </div>
            )}
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Time Survived</span>
              <strong className="text-amber-400 text-sm">{(elapsedTime / 1000).toFixed(1)}s</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRestart}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Restart Run
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              onClick={handleNewWorld}
            >
              New World
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Home className="w-4 h-4 text-slate-400" />}
              onClick={() => navigate('/')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* VICTORY / LEVEL COMPLETE State Overlay */}
      {isMounted && (lifecycleState === 'VICTORY' || lifecycleState === 'LEVEL_COMPLETE') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-canvas-950/90 backdrop-blur-md z-20 animate-fade-in p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-emerald-400 tracking-wider">
              {lifecycleState === 'VICTORY' ? 'VICTORY ACHIEVED!' : 'LEVEL COMPLETED!'}
            </h2>
            <p className="text-xs text-slate-400">All objectives cleared successfully.</p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 py-2 px-6 rounded-lg bg-canvas-900 border border-border-default text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Final Score</span>
              <strong className="text-emerald-400 text-sm">{currentScore}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Clear Time</span>
              <strong className="text-cyan-400 text-sm">{(elapsedTime / 1000).toFixed(1)}s</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {spec?.genre !== 'endless-runner' && (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextLevel}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Next Level
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRestart}
            >
              Replay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Home className="w-4 h-4 text-slate-400" />}
              onClick={() => navigate('/')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Phaser Canvas Tag Badge */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-canvas-900/90 px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1.5 z-10">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            lifecycleState === 'PLAYING'
              ? 'bg-emerald-400 animate-pulse'
              : lifecycleState === 'READY'
              ? 'bg-cyan-400'
              : lifecycleState === 'GAME_OVER'
              ? 'bg-rose-400'
              : 'bg-amber-400'
          }`}
        />
        <span>
          Phaser 3: {spec?.genre?.toUpperCase() || 'PLATFORMER'} [{lifecycleState}]
        </span>
      </div>
    </div>
  );
};
