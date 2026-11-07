import { create } from 'zustand';
import { GameGenre, MechanicType, DifficultyLevel, VisualTheme } from '@shared/core';
import { api } from '../services/api/apiClient';
import { useProjectStore } from './useProjectStore';

interface StudioState {
  prompt: string;
  genre: GameGenre;
  mechanics: MechanicType[];
  difficulty: DifficultyLevel;
  theme: VisualTheme;
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
  setTheme: (theme: VisualTheme) => void;
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
  theme: 'cyberpunk',
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
  setTheme: (theme) => set({ theme }),
  setDimensions: (dimensions) => set({ dimensions }),
  setPhysics: (physics) =>
    set((state) => ({ physics: { ...state.physics, ...physics } })),

  loadPreset: (genre) => {
    if (genre === 'platformer') {
      set({
        mechanics: DEFAULT_MECHANICS,
        theme: 'cyberpunk',
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
        theme: 'dungeon',
        physics: { gravityY: 0, playerSpeed: 240, jumpVelocity: 0 },
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
        theme: 'retro-arcade',
        physics: { gravityY: 850, playerSpeed: 300, jumpVelocity: 580 },
      });
    }
  },

  generateGame: async () => {
    const { prompt, genre, difficulty, theme } = get();
    if (!prompt.trim()) return false;

    set({
      isGenerating: true,
      generationStep: 'Connecting to AI Game Generator...',
      generationProgress: 15,
      generationError: null,
    });

    try {
      setTimeout(() => {
        set({ generationStep: 'Synthesizing scene AST & computing reachability physics...', generationProgress: 45 });
      }, 300);

      setTimeout(() => {
        set({ generationStep: 'Synthesizing Playwright verification scenarios...', generationProgress: 75 });
      }, 700);

      const outcome = await api.generateGame({
        prompt,
        genre,
        difficulty,
        theme,
      });

      set({ generationStep: 'Phaser 3 Engine bundle synthesized!', generationProgress: 100 });

      // Refresh project store
      await useProjectStore.getState().fetchProjects();
      await useProjectStore.getState().selectProject(outcome.project.id);

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
