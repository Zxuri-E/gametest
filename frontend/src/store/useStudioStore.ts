import { create } from 'zustand';
import { GameGenre, MechanicType, DifficultyLevel } from '@shared/core';
import { mockApi } from '../services/mock/mockApiService';
import { useProjectStore } from './useProjectStore';

interface StudioState {
  prompt: string;
  genre: GameGenre;
  mechanics: MechanicType[];
  difficulty: DifficultyLevel;
  dimensions: { width: number; height: number };
  physics: {
    gravityY: number;
    playerSpeed: number;
    jumpVelocity: number;
  };
  isGenerating: boolean;
  generationStep: string;
  generationProgress: number;
  generationError: string | null;

  setPrompt: (prompt: string) => void;
  setGenre: (genre: GameGenre) => void;
  toggleMechanic: (mechanic: MechanicType) => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setDimensions: (dims: { width: number; height: number }) => void;
  setPhysics: (physics: Partial<StudioState['physics']>) => void;
  loadPreset: (genre: GameGenre) => void;
  generateGame: () => Promise<boolean>;
  resetGenerationState: () => void;
}

const DEFAULT_MECHANICS: MechanicType[] = [
  'player-movement',
  'jumping',
  'gravity',
  'platform-collision',
  'enemy-interaction',
  'collectibles',
  'score-system',
  'game-over-condition',
  'level-completion',
];

export const useStudioStore = create<StudioState>((set, get) => ({
  prompt: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
  genre: 'platformer',
  mechanics: DEFAULT_MECHANICS,
  difficulty: 'medium',
  dimensions: { width: 800, height: 600 },
  physics: {
    gravityY: 750,
    playerSpeed: 280,
    jumpVelocity: 520,
  },
  isGenerating: false,
  generationStep: '',
  generationProgress: 0,
  generationError: null,

  setPrompt: (prompt) => set({ prompt }),
  setGenre: (genre) => {
    set({ genre });
    get().loadPreset(genre);
  },

  toggleMechanic: (mechanic) => {
    const current = get().mechanics;
    if (current.includes(mechanic)) {
      if (current.length > 1) {
        set({ mechanics: current.filter((m) => m !== mechanic) });
      }
    } else {
      set({ mechanics: [...current, mechanic] });
    }
  },

  setDifficulty: (difficulty) => set({ difficulty }),
  setDimensions: (dimensions) => set({ dimensions }),
  setPhysics: (physics) =>
    set((state) => ({ physics: { ...state.physics, ...physics } })),

  loadPreset: (genre) => {
    if (genre === 'platformer') {
      set({
        mechanics: DEFAULT_MECHANICS,
        physics: { gravityY: 750, playerSpeed: 280, jumpVelocity: 520 },
      });
    } else if (genre === 'top-down') {
      set({
        mechanics: [
          'player-movement',
          'enemy-interaction',
          'collectibles',
          'score-system',
          'game-over-condition',
          'level-completion',
        ],
        physics: { gravityY: 0, playerSpeed: 320, jumpVelocity: 0 },
      });
    } else if (genre === 'endless-runner') {
      set({
        mechanics: [
          'player-movement',
          'jumping',
          'gravity',
          'platform-collision',
          'enemy-interaction',
          'collectibles',
          'score-system',
          'game-over-condition',
        ],
        physics: { gravityY: 850, playerSpeed: 360, jumpVelocity: 580 },
      });
    }
  },

  generateGame: async () => {
    const { prompt, genre, mechanics, difficulty, dimensions, physics } = get();
    if (!prompt.trim()) return false;

    set({
      isGenerating: true,
      generationStep: 'Initializing AI orchestration pipeline...',
      generationProgress: 5,
      generationError: null,
    });

    try {
      const newSpec = await mockApi.generateGame(
        { prompt, genre, mechanics, difficulty, dimensions, physics },
        (step, progress) => {
          set({ generationStep: step, generationProgress: progress });
        }
      );

      // Refresh project store
      await useProjectStore.getState().fetchProjects();
      useProjectStore.getState().updateActiveSpec(newSpec);

      set({ isGenerating: false });
      return true;
    } catch (err: any) {
      set({
        isGenerating: false,
        generationError: err.message || 'Generation failed',
      });
      return false;
    }
  },

  resetGenerationState: () => {
    set({
      isGenerating: false,
      generationStep: '',
      generationProgress: 0,
      generationError: null,
    });
  },
}));

