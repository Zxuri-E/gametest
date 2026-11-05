import { create } from 'zustand';

interface WorkspaceState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  lives: number;
  fps: number;
  elapsedTimeMs: number;
  entitiesCount: number;
  isDebugMode: boolean;
  showHitboxes: boolean;
  showVectors: boolean;
  showGrid: boolean;
  playerPos: { x: number; y: number; vx: number; vy: number };

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  toggleDebugMode: () => void;
  toggleHitboxes: () => void;
  toggleVectors: () => void;
  toggleGrid: () => void;
  incrementScore: (amount: number) => void;
  decrementLives: () => void;
  updateTelemetry: (telemetry: Partial<{ fps: number; elapsedTimeMs: number; entitiesCount: number; playerPos: { x: number; y: number; vx: number; vy: number } }>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isRunning: true,
  isPaused: false,
  score: 300,
  lives: 3,
  fps: 60,
  elapsedTimeMs: 14250,
  entitiesCount: 14,
  isDebugMode: true,
  showHitboxes: true,
  showVectors: true,
  showGrid: true,
  playerPos: { x: 120, y: 380, vx: 0, vy: 0 },

  startGame: () => set({ isRunning: true, isPaused: false }),
  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  stopGame: () => set({ isRunning: false, isPaused: false }),
  resetGame: () =>
    set({
      isRunning: true,
      isPaused: false,
      score: 0,
      lives: 3,
      elapsedTimeMs: 0,
      playerPos: { x: 100, y: 300, vx: 0, vy: 0 },
    }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  toggleHitboxes: () => set((state) => ({ showHitboxes: !state.showHitboxes })),
  toggleVectors: () => set((state) => ({ showVectors: !state.showVectors })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  decrementLives: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  updateTelemetry: (telemetry) => set((state) => ({ ...state, ...telemetry })),
}));

