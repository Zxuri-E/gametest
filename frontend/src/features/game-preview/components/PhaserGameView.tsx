import React, { useEffect, useRef, useState } from 'react';
import { GameSpecification } from '@shared/core';
import { PhaserRuntimeAdapter } from '@game-engine/runtime';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface PhaserGameViewProps {
  spec: GameSpecification | null;
}

export const PhaserGameView: React.FC<PhaserGameViewProps> = ({ spec }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<PhaserRuntimeAdapter | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const {
    isRunning,
    isPaused,
    showHitboxes,
    showVectors,
    showGrid,
    updateTelemetry,
  } = useWorkspaceStore();

  // Mount & Update Phaser Game Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !spec) return;

    let isDisposed = false;
    const adapter = new PhaserRuntimeAdapter();
    adapterRef.current = adapter;

    adapter.mount(container, spec).then(() => {
      if (!isDisposed) {
        setIsMounted(true);
      }
    });

    // Telemetry Polling Loop from real Phaser runtime
    const telemetryInterval = setInterval(async () => {
      if (adapterRef.current) {
        try {
          const testApi = adapterRef.current.getTestAPI();
          const state = await testApi.getGameState();
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
    }, 120);

    return () => {
      isDisposed = true;
      clearInterval(telemetryInterval);
      setIsMounted(false);
      adapter.unmount();
      adapterRef.current = null;
    };
  }, [spec]);

  // Handle Playback State changes (Pause, Resume, Stop)
  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter) return;

    if (isPaused) {
      adapter.pause();
    } else if (isRunning) {
      adapter.resume();
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

  return (
    <div
      id="phaser-mount-container"
      ref={mountRef}
      className="relative w-full aspect-[4/3] max-h-[580px] bg-canvas-950 rounded-lg overflow-hidden border border-border-default shadow-2xl flex items-center justify-center select-none"
    >
      {!isMounted && (
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-xs">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Mounting Phaser 3.87 Arcade Runtime...</span>
        </div>
      )}

      {/* Phaser Canvas Tag Badge */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-canvas-900/90 px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Phaser 3 Engine: {spec?.genre?.toUpperCase() || 'PLATFORMER'}</span>
      </div>
    </div>
  );
};

