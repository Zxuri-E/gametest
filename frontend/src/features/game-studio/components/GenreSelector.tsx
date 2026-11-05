import React from 'react';
import { GameGenre } from '@shared/core';
import { Layers, Compass, Flame } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface GenreSelectorProps {
  genre: GameGenre;
  onChange: (genre: GameGenre) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ genre, onChange }) => {
  const genres = [
    {
      id: 'platformer' as GameGenre,
      name: '2D Platformer',
      description: 'Side-view with gravity, jump physics, collision tiles, and vertical platforming.',
      icon: Layers,
      accent: 'border-cyan-500 bg-cyan-950/20 text-cyan-400',
    },
    {
      id: 'top-down' as GameGenre,
      name: 'Top-down Game',
      description: 'Orthogonal 8-direction navigation, obstacle collisions, arena combat and dungeons.',
      icon: Compass,
      accent: 'border-indigo-500 bg-indigo-950/20 text-indigo-400',
    },
    {
      id: 'endless-runner' as GameGenre,
      name: 'Endless Runner',
      description: 'Constant forward scrolling, procedural hazard spawning, and reflex timing.',
      icon: Flame,
      accent: 'border-amber-500 bg-amber-950/20 text-amber-400',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">
        1. Select Game Genre Architecture
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {genres.map((g) => {
          const Icon = g.icon;
          const isSelected = genre === g.id;
          return (
            <div
              key={g.id}
              onClick={() => onChange(g.id)}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none relative',
                isSelected
                  ? 'bg-canvas-850 border-cyan-400 shadow-subtle-glow ring-1 ring-cyan-400/40'
                  : 'bg-canvas-900 border-border-default hover:border-border-hover hover:bg-canvas-850/50'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('p-2 rounded-md border border-border-subtle bg-canvas-800', isSelected && g.accent)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-slate-100">{g.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-normal">{g.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

