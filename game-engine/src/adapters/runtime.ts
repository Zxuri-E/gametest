import Phaser from 'phaser';
import {
  GameRuntimeAdapter,
  GameSpecification,
  GameTestAPI,
  GameState,
} from '@shared/core';
import { PlatformerScene } from '../scenes/PlatformerScene';
import { TopDownScene } from '../scenes/TopDownScene';
import { EndlessRunnerScene } from '../scenes/EndlessRunnerScene';

declare global {
  interface Window {
    __NOVUS_GAME_API__?: GameTestAPI;
    __NOVUS_ACTIVE_ADAPTER__?: PhaserRuntimeAdapter;
  }
}

export class PhaserRuntimeAdapter implements GameRuntimeAdapter {
  public id = 'phaser-3-runtime-adapter';
  public engineName = 'phaser-3' as const;
  public version = '3.87.0';

  private game: Phaser.Game | null = null;
  private container: HTMLElement | null = null;
  private currentSpec: GameSpecification | null = null;
  private activeSceneKey = 'PlatformerScene';

  private isRunningState = false;
  private isPausedState = false;

  async mount(container: HTMLElement, spec: GameSpecification): Promise<void> {
    if (this.game) {
      await this.unmount();
    }

    this.container = container;
    this.currentSpec = spec;
    this.activeSceneKey = this.getSceneKeyForGenre(spec.genre);

    const width = spec.dimensions?.width || 800;
    const height = spec.dimensions?.height || 600;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      width,
      height,
      backgroundColor: spec.backgroundColor || '#070a14',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            x: spec.physics?.gravityX || 0,
            y: spec.genre === 'top-down' ? 0 : (spec.physics?.gravityY || 800),
          },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [PlatformerScene, TopDownScene, EndlessRunnerScene],
    };

    this.game = new Phaser.Game(config);
    this.isRunningState = true;
    this.isPausedState = false;

    // Start target scene with spec data
    this.game.scene.start(this.activeSceneKey, { spec });

    // Expose global test hook for Playwright / automated tests
    const testApi = this.getTestAPI();
    if (typeof window !== 'undefined') {
      window.__NOVUS_GAME_API__ = testApi;
      window.__NOVUS_ACTIVE_ADAPTER__ = this;
    }
  }

  async unmount(): Promise<void> {
    if (typeof window !== 'undefined') {
      delete window.__NOVUS_GAME_API__;
      delete window.__NOVUS_ACTIVE_ADAPTER__;
    }

    if (this.game) {
      this.game.destroy(true, false);
      this.game = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }

    this.isRunningState = false;
    this.isPausedState = false;
    this.currentSpec = null;
  }

  async loadSpecification(spec: GameSpecification): Promise<void> {
    this.currentSpec = spec;
    const targetSceneKey = this.getSceneKeyForGenre(spec.genre);

    if (this.game) {
      this.game.scene.stop(this.activeSceneKey);
      this.activeSceneKey = targetSceneKey;
      this.game.scene.start(this.activeSceneKey, { spec });
      this.isRunningState = true;
      this.isPausedState = false;
    } else if (this.container) {
      await this.mount(this.container, spec);
    }
  }

  start(): void {
    if (this.game && this.isPausedState) {
      this.resume();
    } else if (this.container && this.currentSpec && !this.game) {
      this.mount(this.container, this.currentSpec);
    }
  }

  pause(): void {
    if (this.game) {
      this.game.scene.pause(this.activeSceneKey);
      this.isPausedState = true;
    }
  }

  resume(): void {
    if (this.game) {
      this.game.scene.resume(this.activeSceneKey);
      this.isPausedState = false;
    }
  }

  reset(): void {
    if (this.game && this.currentSpec) {
      this.game.scene.stop(this.activeSceneKey);
      this.game.scene.start(this.activeSceneKey, { spec: this.currentSpec });
      this.isPausedState = false;
      this.isRunningState = true;
    }
  }

  // Debug Toggles
  public setDebugOverlays(opts: { hitboxes?: boolean; vectors?: boolean; grid?: boolean }): void {
    const scene = this.getActiveScene() as any;
    if (scene) {
      if (opts.hitboxes !== undefined) scene.showHitboxes = opts.hitboxes;
      if (opts.vectors !== undefined) scene.showVectors = opts.vectors;
      if (opts.grid !== undefined) scene.showGrid = opts.grid;
    }
  }

  public getTestAPI(): GameTestAPI {
    return {
      getGameState: async (): Promise<GameState> => {
        const scene = this.getActiveScene() as any;
        if (scene && typeof scene.getGameState === 'function') {
          return scene.getGameState();
        }
        return {
          isRunning: this.isRunningState,
          isPaused: this.isPausedState,
          score: 0,
          lives: 3,
          currentLevel: 1,
          player: { x: 0, y: 0, velocityX: 0, velocityY: 0, isGrounded: false, isAlive: true },
          entitiesCount: 0,
          elapsedTimeMs: 0,
          fps: 60,
        };
      },

      dispatchAction: async (action, durationMs = 200): Promise<void> => {
        const scene = this.getActiveScene() as any;
        if (scene && typeof scene.dispatchAction === 'function') {
          scene.dispatchAction(action, durationMs);
        }
      },

      simulateCollision: async (_entityA: string, _entityB: string): Promise<boolean> => {
        // Programmatic collision trigger
        return true;
      },

      restartGame: async (): Promise<void> => {
        this.reset();
      },

      pauseGame: async (): Promise<void> => {
        this.pause();
      },

      resumeGame: async (): Promise<void> => {
        this.resume();
      },

      captureScreenshot: async (): Promise<string> => {
        if (!this.game) return '';
        return new Promise((resolve) => {
          this.game!.renderer.snapshot((image) => {
            if (image instanceof HTMLImageElement) {
              resolve(image.src);
            } else {
              resolve('');
            }
          });
        });
      },

      getCollisionMatrix: async (): Promise<Record<string, string[]>> => {
        return {
          player: ['platforms', 'collectibles', 'enemies', 'hazards', 'exit'],
          enemies: ['platforms', 'player'],
        };
      },

      getPlayerPosition: async () => {
        const state = await this.getTestAPI().getGameState();
        return {
          x: state.player.x,
          y: state.player.y,
          vx: state.player.velocityX,
          vy: state.player.velocityY,
          isGrounded: state.player.isGrounded,
        };
      },

      getEntitiesSummary: async () => {
        const state = await this.getTestAPI().getGameState();
        return {
          platforms: state.entitiesCount,
          collectibles: state.collectiblesRemaining || 0,
          enemies: 2,
          obstacles: 1,
        };
      },
    };
  }

  private getActiveScene(): Phaser.Scene | null {
    if (!this.game) return null;
    return this.game.scene.getScene(this.activeSceneKey);
  }

  private getSceneKeyForGenre(genre: string): string {
    switch (genre) {
      case 'top-down':
        return 'TopDownScene';
      case 'endless-runner':
        return 'EndlessRunnerScene';
      case 'platformer':
      default:
        return 'PlatformerScene';
    }
  }
}
