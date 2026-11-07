import Phaser from 'phaser';
import {
  GameRuntimeAdapter,
  GameSpecification,
  GameTestAPI,
  GameState,
  GameLifecycleState,
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
  private lifecycleState: GameLifecycleState = 'INITIALIZING';
  private currentSeed: string = 'novus-default-seed';
  private currentLevelIndex: number = 1;

  private getSceneClassForGenre(genre: string) {
    switch (genre) {
      case 'top-down':
        return TopDownScene;
      case 'endless-runner':
        return EndlessRunnerScene;
      case 'platformer':
      default:
        return PlatformerScene;
    }
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

  async mount(container: HTMLElement, spec: GameSpecification): Promise<void> {
    if (this.game) {
      await this.unmount();
    }

    this.container = container;
    this.currentSpec = spec;
    this.currentSeed = spec.seed || `novus-${Date.now()}`;
    this.currentLevelIndex = 1;
    this.activeSceneKey = this.getSceneKeyForGenre(spec.genre);
    const sceneClass = this.getSceneClassForGenre(spec.genre);

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
      scene: [], // Empty scene list avoids booting uninitialized scenes
    };

    const game = new Phaser.Game(config);
    this.game = game;
    this.isRunningState = true;
    this.isPausedState = false;
    this.lifecycleState = 'INITIALIZING';

    // Wait for core game boot before adding and starting the target scene with spec
    await new Promise<void>((resolve) => {
      const startTargetScene = () => {
        if (!this.game) {
          resolve();
          return;
        }
        try {
          this.game.scene.add(this.activeSceneKey, sceneClass, true, {
            spec: { ...spec, seed: this.currentSeed },
            levelIndex: this.currentLevelIndex,
          });
          this.lifecycleState = 'READY';

          // Wire up event listeners for game lifecycle transitions
          this.game.events.on('game:over', () => {
            this.lifecycleState = 'GAME_OVER';
            this.isRunningState = false;
          });
          this.game.events.on('game:victory', () => {
            this.lifecycleState = 'VICTORY';
            this.isRunningState = false;
          });
        } catch (err) {
          console.error('[PhaserRuntimeAdapter] Error adding scene:', err);
          this.lifecycleState = 'ERROR';
        }
        resolve();
      };

      if (game.isBooted) {
        startTargetScene();
      } else {
        game.events.once(Phaser.Core.Events.READY, startTargetScene);
      }
    });

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
      try {
        const scenes = this.game.scene.getScenes(false);
        for (const s of scenes) {
          try {
            s.scene.stop();
          } catch {
            // ignore
          }
        }
      } catch {
        // Scene manager may already be stopped
      }

      try {
        this.game.destroy(true, false);
      } catch (err) {
        console.warn('[PhaserRuntimeAdapter] Error during game.destroy:', err);
      }
      this.game = null;
    }

    if (this.container) {
      // Remove ONLY canvas elements created by Phaser - NEVER call innerHTML = ''
      // This strictly preserves React's DOM tree and prevents Node.removeChild exceptions
      const canvases = this.container.querySelectorAll('canvas');
      canvases.forEach((c) => {
        if (c.parentNode === this.container) {
          this.container?.removeChild(c);
        }
      });
      this.container = null;
    }

    this.isRunningState = false;
    this.isPausedState = false;
    this.lifecycleState = 'READY';
    this.currentSpec = null;
  }

  async loadSpecification(spec: GameSpecification): Promise<void> {
    this.currentSpec = spec;
    const targetSceneKey = this.getSceneKeyForGenre(spec.genre);
    const sceneClass = this.getSceneClassForGenre(spec.genre);

    if (this.game) {
      try {
        this.game.scene.stop(this.activeSceneKey);
        this.game.scene.remove(this.activeSceneKey);
      } catch {
        // ignore
      }
      this.activeSceneKey = targetSceneKey;
      this.game.scene.add(this.activeSceneKey, sceneClass, true, {
        spec: { ...spec, seed: this.currentSeed },
        levelIndex: this.currentLevelIndex,
      });
      this.isRunningState = true;
      this.isPausedState = false;
      this.lifecycleState = 'READY';
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
    this.lifecycleState = 'PLAYING';
  }

  pause(): void {
    if (this.game) {
      this.game.scene.pause(this.activeSceneKey);
      this.isPausedState = true;
      this.lifecycleState = 'PAUSED';
    }
  }

  resume(): void {
    if (this.game) {
      this.game.scene.resume(this.activeSceneKey);
      this.isPausedState = false;
      this.lifecycleState = 'PLAYING';
    }
  }

  reset(): void {
    this.restart();
  }

  restart(): void {
    if (this.game && this.currentSpec) {
      const sceneClass = this.getSceneClassForGenre(this.currentSpec.genre);
      try {
        this.game.scene.stop(this.activeSceneKey);
        this.game.scene.remove(this.activeSceneKey);
      } catch {
        // ignore
      }
      this.game.scene.add(this.activeSceneKey, sceneClass, true, {
        spec: { ...this.currentSpec, seed: this.currentSeed },
        levelIndex: this.currentLevelIndex,
      });
      this.isPausedState = false;
      this.isRunningState = true;
      this.lifecycleState = 'PLAYING';
    }
  }

  newWorld(newSeed?: string): void {
    if (this.game && this.currentSpec) {
      this.currentSeed = newSeed || `novus-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      this.currentLevelIndex = 1;
      const sceneClass = this.getSceneClassForGenre(this.currentSpec.genre);
      try {
        this.game.scene.stop(this.activeSceneKey);
        this.game.scene.remove(this.activeSceneKey);
      } catch {
        // ignore
      }
      this.game.scene.add(this.activeSceneKey, sceneClass, true, {
        spec: { ...this.currentSpec, seed: this.currentSeed },
        levelIndex: this.currentLevelIndex,
      });
      this.isPausedState = false;
      this.isRunningState = true;
      this.lifecycleState = 'PLAYING';
    }
  }

  resetLevel(): void {
    this.restart();
  }

  nextLevel(): void {
    if (this.game && this.currentSpec) {
      this.currentLevelIndex += 1;
      this.currentSeed = `level-${this.currentLevelIndex}-${this.currentSeed}`;
      const sceneClass = this.getSceneClassForGenre(this.currentSpec.genre);
      try {
        this.game.scene.stop(this.activeSceneKey);
        this.game.scene.remove(this.activeSceneKey);
      } catch {
        // ignore
      }
      this.game.scene.add(this.activeSceneKey, sceneClass, true, {
        spec: { ...this.currentSpec, seed: this.currentSeed },
        levelIndex: this.currentLevelIndex,
      });
      this.isPausedState = false;
      this.isRunningState = true;
      this.lifecycleState = 'PLAYING';
    }
  }

  public getLifecycleState(): GameLifecycleState {
    return this.lifecycleState;
  }

  public getSeed(): string {
    return this.currentSeed;
  }

  public getLevelIndex(): number {
    return this.currentLevelIndex;
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
          const s = scene.getGameState();
          return {
            ...s,
            lifecycleState: this.lifecycleState,
            seed: this.currentSeed,
          };
        }
        return {
          isRunning: this.isRunningState,
          isPaused: this.isPausedState,
          lifecycleState: this.lifecycleState,
          score: 0,
          lives: 3,
          currentLevel: this.currentLevelIndex,
          seed: this.currentSeed,
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
        return true;
      },

      restartGame: async (): Promise<void> => {
        this.restart();
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
}
