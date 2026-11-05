import React from 'react';
import { Activity, Gauge, Terminal, Shield, Zap } from 'lucide-react';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { GameSpecification } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Slider } from '../../../components/ui/Slider';

interface GameInspectorPanelProps {
  spec: GameSpecification | null;
  onUpdateSpec: (fields: Partial<GameSpecification>) => void;
}

export const GameInspectorPanel: React.FC<GameInspectorPanelProps> = ({
  spec,
  onUpdateSpec,
}) => {
  const { fps, score, lives, playerPos, entitiesCount } = useWorkspaceStore();

  return (
    <div className="space-y-4">
      {/* Live Telemetry Card */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Live Engine Telemetry
            </h3>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Framerate</span>
            <span className="text-emerald-400 text-base font-bold">{fps} FPS</span>
          </div>

          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Entities Count</span>
            <span className="text-cyan-400 text-base font-bold">{entitiesCount} Active</span>
          </div>

          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Player Pos (X, Y)</span>
            <span className="text-slate-200 font-semibold">{playerPos.x}, {playerPos.y}</span>
          </div>

          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Velocity (Vx, Vy)</span>
            <span className="text-amber-400 font-semibold">{playerPos.vx}, {playerPos.vy}</span>
          </div>

          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Score Points</span>
            <span className="text-cyan-300 text-base font-bold">{score}</span>
          </div>

          <div className="p-2.5 rounded bg-canvas-950 border border-border-subtle">
            <span className="text-[10px] text-slate-500 block uppercase">Player Lives</span>
            <span className="text-rose-400 text-base font-bold">{'♥'.repeat(lives)} ({lives})</span>
          </div>
        </div>
      </Card>

      {/* Real-time Physics Tuning */}
      {spec && (
        <Card
          header={
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Live Physics Tweaker
              </h3>
            </div>
          }
        >
          <div className="space-y-4">
            <Slider
              label="Active Gravity (px/s²)"
              valueDisplay={`${spec.physics.gravityY} px/s²`}
              min={0}
              max={1500}
              step={50}
              value={spec.physics.gravityY}
              onChange={(e) =>
                onUpdateSpec({
                  physics: { ...spec.physics, gravityY: Number(e.target.value) },
                })
              }
            />

            <Slider
              label="Player Speed (px/s)"
              valueDisplay={`${spec.physics.playerSpeed} px/s`}
              min={100}
              max={600}
              step={20}
              value={spec.physics.playerSpeed}
              onChange={(e) =>
                onUpdateSpec({
                  physics: { ...spec.physics, playerSpeed: Number(e.target.value) },
                })
              }
            />

            <Slider
              label="Jump Velocity (px/s)"
              valueDisplay={`${spec.physics.jumpVelocity} px/s`}
              min={100}
              max={900}
              step={20}
              value={spec.physics.jumpVelocity}
              onChange={(e) =>
                onUpdateSpec({
                  physics: { ...spec.physics, jumpVelocity: Number(e.target.value) },
                })
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
};
