import React from 'react';
import { MechanicType } from '@shared/core';
import {
  Move,
  ArrowUp,
  ArrowDown,
  Square,
  Skull,
  Coins,
  Trophy,
  AlertOctagon,
  Flag,
  Check,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

interface MechanicsSelectorProps {
  selectedMechanics: MechanicType[];
  onToggle: (mechanic: MechanicType) => void;
}

export const MechanicsSelector: React.FC<MechanicsSelectorProps> = ({
  selectedMechanics,
  onToggle,
}) => {
  const mechanicsList: { id: MechanicType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'player-movement',
      label: 'Player Movement',
      icon: <Move className="w-3.5 h-3.5" />,
      desc: 'Keyboard & directional vectors',
    },
    {
      id: 'jumping',
      label: 'Jumping Mechanics',
      icon: <ArrowUp className="w-3.5 h-3.5" />,
      desc: 'Impulse velocities & variable heights',
    },
    {
      id: 'gravity',
      label: 'Gravity Simulation',
      icon: <ArrowDown className="w-3.5 h-3.5" />,
      desc: 'Downward acceleration vector',
    },
    {
      id: 'platform-collision',
      label: 'Platform Collision',
      icon: <Square className="w-3.5 h-3.5" />,
      desc: 'Solid surface landing & AABB checks',
    },
    {
      id: 'enemy-interaction',
      label: 'Enemy Interaction',
      icon: <Skull className="w-3.5 h-3.5" />,
      desc: 'Hazard contact, damage & patrol',
    },
    {
      id: 'collectibles',
      label: 'Collectibles',
      icon: <Coins className="w-3.5 h-3.5" />,
      desc: 'Items, coins & shard triggers',
    },
    {
      id: 'score-system',
      label: 'Score System',
      icon: <Trophy className="w-3.5 h-3.5" />,
      desc: 'Real-time counters & multipliers',
    },
    {
      id: 'game-over-condition',
      label: 'Game-Over Condition',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      desc: 'Life exhaustion & pitfall traps',
    },
    {
      id: 'level-completion',
      label: 'Level Completion',
      icon: <Flag className="w-3.5 h-3.5" />,
      desc: 'Exit portal & win state trigger',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">
          2. Required Game Mechanics ({selectedMechanics.length} Active)
        </label>
        <span className="text-[11px] text-slate-500">
          Synthesizes corresponding Playwright assertion tests
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {mechanicsList.map((m) => {
          const isSelected = selectedMechanics.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => onToggle(m.id)}
              className={cn(
                'p-3 rounded-md border cursor-pointer transition-all flex items-start gap-3 select-none',
                isSelected
                  ? 'bg-canvas-850 border-cyan-500/70 shadow-sm'
                  : 'bg-canvas-900 border-border-default hover:border-border-hover opacity-70 hover:opacity-100'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs border mt-0.5',
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-canvas-800 text-transparent border-border-default'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <span className="text-slate-400">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

