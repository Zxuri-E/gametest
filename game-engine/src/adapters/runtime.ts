import { GameRuntimeAdapter, GameSpecification, GameTestAPI, GameState } from '@shared/core';

/**
 * Standard Phaser 3 runtime adapter foundation.
 * Future Phaser scene lifecycle and physics bindings will be mounted here.
 */
export class PhaserRuntimeAdapter implements GameRuntimeAdapter {
  id = 'phaser-3-adapter';
  engineName = 'phaser-3' as const;
  version = '3.80.0';

  private container: HTMLElement | null = null;
  private currentSpec: GameSpecification | null = null;
  private isRunning = false;
  private isPaused = false;

  async mount(container: HTMLElement, spec: GameSpecification): Promise<void> {
    this.container = container;
    this.currentSpec = spec;
    console.log(`[GameEngine] Mounting Phaser runtime for spec: ${spec.title}`);
  }

  async unmount(): Promise<void> {
    this.container = null;
    this.currentSpec = null;
    this.isRunning = false;
    this.isPaused = false;
  }

  start(): void {
    this.isRunning = true;
    this.isPaused = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  reset(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  getTestAPI(): GameTestAPI {
    return {
      getGameState: async (): Promise<GameState> => ({
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        score: 0,
        lives: 3,
        currentLevel: 1,
        player: {
          x: 100,
          y: 300,
          velocityX: 0,
          velocityY: 0,
          isGrounded: true,
          isAlive: true,
        },
        entitiesCount: 12,
        elapsedTimeMs: 0,
        fps: 60,
      }),
      dispatchAction: async () => {},
      simulateCollision: async () => true,
      restartGame: async () => this.reset(),
      pauseGame: async () => this.pause(),
      resumeGame: async () => this.resume(),
      captureScreenshot: async () => 'data:image/png;base64,placeholder',
      getCollisionMatrix: async () => ({ player: ['platform', 'coin', 'enemy'] }),
    };
  }
}

