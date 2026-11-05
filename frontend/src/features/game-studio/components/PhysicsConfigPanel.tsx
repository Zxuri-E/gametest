import React from 'react';
import { DifficultyLevel } from '@shared/core';
import { Slider } from '../../../components/ui/Slider';
import { Select } from '../../../components/ui/Select';
import { Gauge, SlidersHorizontal } from 'lucide-react';

interface PhysicsConfigPanelProps {
  difficulty: DifficultyLevel;
  onDifficultyChange: (diff: DifficultyLevel) => void;
  dimensions: { width: number; height: number };
  onDimensionsChange: (dims: { width: number; height: number }) => void;
  physics: {
    gravityY: number;
    playerSpeed: number;
    jumpVelocity: number;
  };
  onPhysicsChange: (physics: Partial<PhysicsConfigPanelProps['physics']>) => void;
}

export const PhysicsConfigPanel: React.FC<PhysicsConfigPanelProps> = ({
  difficulty,
  onDifficultyChange,
  dimensions,
  onDimensionsChange,
  physics,
  onPhysicsChange,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-canvas-900 border border-border-default">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            3. Physics & World Parameters
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Difficulty Selection */}
        <Select
          label="Game Difficulty Tuning"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel)}
          options={[
            { value: 'easy', label: 'Easy (Permissive windows, low gravity)' },
            { value: 'medium', label: 'Medium (Standard physics balance)' },
            { value: 'hard', label: 'Hard (Precise platforming, fast hazards)' },
          ]}
        />

        {/* Viewport Resolution */}
        <Select
          label="Canvas Viewport Resolution"
          value={`${dimensions.width}x${dimensions.height}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            onDimensionsChange({ width: w || 800, height: h || 600 });
          }}
          options={[
            { value: '800x600', label: '800 × 600 (Standard 4:3 Studio)' },
            { value: '960x540', label: '960 × 540 (16:9 HD Ready)' },
            { value: '640x480', label: '640 × 480 (Retro Arcade 4:3)' },
            { value: '1024x768', label: '1024 × 768 (Desktop XGA)' },
          ]}
        />
      </div>

      <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-5">
        <Slider
          label="Vertical Gravity (px/s²)"
          valueDisplay={`${physics.gravityY} px/s²`}
          min={0}
          max={1500}
          step={50}
          value={physics.gravityY}
          onChange={(e) => onPhysicsChange({ gravityY: Number(e.target.value) })}
        />

        <Slider
          label="Player Speed (px/s)"
          valueDisplay={`${physics.playerSpeed} px/s`}
          min={100}
          max={700}
          step={20}
          value={physics.playerSpeed}
          onChange={(e) => onPhysicsChange({ playerSpeed: Number(e.target.value) })}
        />

        <Slider
          label="Jump Impulse Velocity"
          valueDisplay={`${physics.jumpVelocity} px/s`}
          min={0}
          max={1000}
          step={20}
          value={physics.jumpVelocity}
          onChange={(e) => onPhysicsChange({ jumpVelocity: Number(e.target.value) })}
        />
      </div>
    </div>
  );
};

