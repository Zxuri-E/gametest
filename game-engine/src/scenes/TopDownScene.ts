import Phaser from 'phaser';
import { GameSpecification, GameState, SeededRandom } from '@shared/core';
import { generateProceduralTextures } from '../assets/textureGenerator';

export class TopDownScene extends Phaser.Scene {
  private spec!: GameSpecification;
  private player!: Phaser.Physics.Arcade.Sprite;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private collectiblesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private exitPortal!: Phaser.Physics.Arcade.Sprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private programmaticAction: string | null = null;
  private programmaticActionEndTime = 0;

  private score = 0;
  private health = 3;
  private totalKeysNeeded = 0;
  private keysCollected = 0;
  private isGameOver = false;
  private isVictory = false;
  private isInvulnerable = false;
  private invulnerableTimer = 0;
  private currentLevel = 1;

  // Debug visual graphics
  private debugGraphics!: Phaser.GameObjects.Graphics;
  public showHitboxes = false;
  public showVectors = false;
  public showGrid = false;

  constructor() {
    super({ key: 'TopDownScene' });
  }

  init(data: { spec: GameSpecification; levelIndex?: number }) {
    this.spec = data?.spec || {};
    this.currentLevel = data?.levelIndex || 1;
    this.score = 0;
    this.health = this.spec.player?.maxLives ?? 3;
    this.totalKeysNeeded = 0;
    this.keysCollected = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.isInvulnerable = false;
    this.programmaticAction = null;
  }

  preload() {
    generateProceduralTextures(this, this.spec.theme || 'dungeon');
  }

  create() {
    const { width, height } = this.scale;
    const rng = new SeededRandom(this.spec.seed || `novus-crypt-${this.currentLevel}`);

    // Arena dimensions
    const arenaW = this.spec.topDownConfig?.arenaWidth || Math.max(width, 1000);
    const arenaH = this.spec.topDownConfig?.arenaHeight || Math.max(height, 800);

    // Background tile grid
    this.cameras.main.setBackgroundColor(this.spec.backgroundColor || '#0c0a17');
    for (let x = 16; x < arenaW; x += 32) {
      for (let y = 16; y < arenaH; y += 32) {
        this.add.image(x, y, 'dungeon_floor').setDepth(0);
      }
    }

    // Groups
    this.wallsGroup = this.physics.add.staticGroup();
    this.collectiblesGroup = this.physics.add.staticGroup();
    this.enemiesGroup = this.physics.add.group({ allowGravity: false });

    // Outer perimeter walls
    this.createWall(arenaW / 2, 12, arenaW, 24); // Top
    this.createWall(arenaW / 2, arenaH - 12, arenaW, 24); // Bottom
    this.createWall(12, arenaH / 2, 24, arenaH); // Left
    this.createWall(arenaW - 12, arenaH / 2, 24, arenaH); // Right

    // Interior walls: use spec or seeded procedural generation
    if (this.spec.topDownConfig?.walls && this.spec.topDownConfig.walls.length > 0) {
      this.spec.topDownConfig.walls.forEach((w) => this.createWall(w.x, w.y, w.width, w.height));
    } else {
      // Seeded procedural corridor barriers
      const wallCount = rng.nextInt(4, 7);
      for (let i = 0; i < wallCount; i++) {
        const isHorizontal = rng.nextBoolean();
        const wx = rng.nextInt(180, arenaW - 180);
        const wy = rng.nextInt(160, arenaH - 160);
        const wWidth = isHorizontal ? rng.nextInt(120, 240) : 28;
        const wHeight = isHorizontal ? 28 : rng.nextInt(120, 240);
        this.createWall(wx, wy, wWidth, wHeight);
      }
    }

    // Exit Portal at far opposite corner
    const exitX = this.spec.topDownConfig?.exitX || arenaW - 80;
    const exitY = this.spec.topDownConfig?.exitY || arenaH - 80;
    this.exitPortal = this.physics.add.staticSprite(exitX, exitY, 'finish_portal').setDepth(2);

    // Player spawn: safe starting area at top-left
    const startX = this.spec.player?.startX || 80;
    const startY = this.spec.player?.startY || 80;
    this.player = this.physics.add.sprite(startX, startY, 'player_idle');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(250);
    this.player.setDepth(10);
    this.player.setSize(20, 26);

    // Relic Key Collectibles: seeded placement away from player spawn
    const keyCount = rng.nextInt(3, 5);
    this.totalKeysNeeded = keyCount;
    for (let k = 0; k < keyCount; k++) {
      const kx = rng.nextInt(160, arenaW - 120);
      const ky = rng.nextInt(140, arenaH - 120);
      const keyItem = this.collectiblesGroup.create(kx, ky, 'relic_key') as Phaser.Physics.Arcade.Sprite;
      keyItem.setData('points', 250);
      keyItem.setData('id', `relic-${k + 1}`);
      keyItem.setDepth(5);
    }

    // Enemies (Top-down roaming crypt guards)
    const enemyCount = rng.nextInt(2, 4);
    for (let e = 0; e < enemyCount; e++) {
      // Spawn at least 250px away from player
      let ex = rng.nextInt(260, arenaW - 100);
      let ey = rng.nextInt(260, arenaH - 100);
      const enemy = this.enemiesGroup.create(ex, ey, 'enemy_patrol') as Phaser.Physics.Arcade.Sprite;
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      const speed = rng.nextInt(60, 95);
      enemy.setData('speed', speed);
      enemy.setData('damage', 1);
      enemy.setDepth(8);

      // Random initial trajectory
      const angle = rng.nextFloat(0, Math.PI * 2);
      enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    // Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.enemiesGroup, this.wallsGroup);

    // Key Collection Overlap
    this.physics.add.overlap(this.player, this.collectiblesGroup, (_p, colObj) => {
      const col = colObj as Phaser.Physics.Arcade.Sprite;
      this.score += (col.getData('points') as number) || 250;
      this.keysCollected += 1;
      this.createSparkBurst(col.x, col.y, 0xfbbf24);
      col.destroy();

      if (this.keysCollected >= this.totalKeysNeeded) {
        // Unlock exit portal effect
        this.exitPortal.setTint(0x34d399);
      }
      this.game.events.emit('game:state-update', this.getGameState());
    });

    // Enemy Collision
    this.physics.add.overlap(this.player, this.enemiesGroup, () => {
      this.handleDamage();
    });

    // Exit Portal Overlap -> Victory
    this.physics.add.overlap(this.player, this.exitPortal, () => {
      if (this.keysCollected >= Math.max(1, Math.floor(this.totalKeysNeeded * 0.75))) {
        this.handleVictory();
      }
    });

    // Keyboard Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Camera follow player with bounds
    this.cameras.main.setBounds(0, 0, arenaW, arenaH);
    this.physics.world.setBounds(0, 0, arenaW, arenaH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Debug Graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    // Register clean shutdown listener
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.debugGraphics) {
        this.debugGraphics.clear();
      }
    });

    this.game.events.emit('game:ready');
  }

  private createWall(x: number, y: number, width: number, height: number) {
    const wall = this.wallsGroup.create(x, y, 'dungeon_wall') as Phaser.Physics.Arcade.Sprite;
    wall.setDisplaySize(width, height);
    wall.refreshBody();
    wall.setDepth(3);
  }

  private handleDamage() {
    if (this.isInvulnerable || this.isGameOver || this.isVictory) return;
    this.health -= 1;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.time.now + 1000;
    this.createSparkBurst(this.player.x, this.player.y, 0xf43f5e);

    if (this.health <= 0) {
      this.isGameOver = true;
      this.player.setTint(0xf43f5e);
      this.player.setVelocity(0, 0);
      this.game.events.emit('game:over', {
        finalScore: this.score,
        reason: 'Health depleted by crypt guardian',
      });
    }
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private handleVictory() {
    if (this.isVictory || this.isGameOver) return;
    this.isVictory = true;
    this.player.setVelocity(0, 0);
    this.createSparkBurst(this.player.x, this.player.y, 0x10b981);
    this.game.events.emit('game:victory', {
      finalScore: this.score + 500,
      keysCollected: this.keysCollected,
    });
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private createSparkBurst(x: number, y: number, color: number) {
    for (let i = 0; i < 6; i++) {
      const spark = this.add.image(x, y, 'particle_spark');
      spark.setTint(color);
      spark.setDepth(50);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 25;
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }
  }

  update(time: number) {
    if (this.isGameOver || this.isVictory) {
      this.renderDebugVisuals();
      return;
    }

    if (this.isInvulnerable) {
      this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.3 : 1);
      if (time > this.invulnerableTimer) {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      }
    }

    // Normalized 8-Way Movement
    const speed = this.spec.physics.playerSpeed || 240;
    let dx = 0;
    let dy = 0;

    let up = Boolean((this.cursors && this.cursors.up.isDown) || (this.wasdKeys && this.wasdKeys['w']?.isDown));
    let down = Boolean((this.cursors && this.cursors.down.isDown) || (this.wasdKeys && this.wasdKeys['s']?.isDown));
    let left = Boolean((this.cursors && this.cursors.left.isDown) || (this.wasdKeys && this.wasdKeys['a']?.isDown));
    let right = Boolean((this.cursors && this.cursors.right.isDown) || (this.wasdKeys && this.wasdKeys['d']?.isDown));

    if (this.programmaticAction) {
      if (time < this.programmaticActionEndTime) {
        if (this.programmaticAction === 'up') up = true;
        if (this.programmaticAction === 'down') down = true;
        if (this.programmaticAction === 'left') left = true;
        if (this.programmaticAction === 'right') right = true;
      } else {
        this.programmaticAction = null;
      }
    }

    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dy -= 1;
    if (down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      // Diagonal normalization factor: 1 / sqrt(2) ≈ 0.7071
      const normFactor = 0.7071;
      this.player.setVelocity(dx * speed * normFactor, dy * speed * normFactor);
    } else {
      this.player.setVelocity(dx * speed, dy * speed);
    }

    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);

    // Roaming Enemy Steering (keep moving smoothly)
    this.enemiesGroup.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const spd = (enemy.getData('speed') as number) || 70;
      const vx = enemy.body!.velocity.x;
      const vy = enemy.body!.velocity.y;
      if (Math.abs(vx) < 5 && Math.abs(vy) < 5) {
        const angle = Math.random() * Math.PI * 2;
        enemy.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      }
    });

    this.renderDebugVisuals();
  }

  private renderDebugVisuals() {
    this.debugGraphics.clear();
    if (!this.showHitboxes && !this.showVectors && !this.showGrid) return;

    if (this.showGrid) {
      this.debugGraphics.lineStyle(1, 0x1e293b, 0.4);
      const arenaW = this.spec.topDownConfig?.arenaWidth || 1000;
      const arenaH = this.spec.topDownConfig?.arenaHeight || 800;
      for (let x = 0; x < arenaW; x += 40) {
        this.debugGraphics.lineBetween(x, 0, x, arenaH);
      }
      for (let y = 0; y < arenaH; y += 40) {
        this.debugGraphics.lineBetween(0, y, arenaW, y);
      }
    }

    if (this.showHitboxes && this.player) {
      this.debugGraphics.lineStyle(1.5, 0x10b981, 1);
      this.debugGraphics.strokeRect(
        this.player.body!.x,
        this.player.body!.y,
        this.player.body!.width,
        this.player.body!.height
      );

      this.debugGraphics.lineStyle(1, 0x38bdf8, 0.8);
      this.wallsGroup.getChildren().forEach((w) => {
        const wall = w as Phaser.Physics.Arcade.Sprite;
        this.debugGraphics.strokeRect(wall.body!.x, wall.body!.y, wall.body!.width, wall.body!.height);
      });
    }

    if (this.showVectors && this.player) {
      this.debugGraphics.lineStyle(2, 0xf59e0b, 1);
      this.debugGraphics.lineBetween(
        this.player.x,
        this.player.y,
        this.player.x + this.player.body!.velocity.x * 0.15,
        this.player.y + this.player.body!.velocity.y * 0.15
      );
    }
  }

  public dispatchAction(action: string, durationMs = 200) {
    this.programmaticAction = action;
    this.programmaticActionEndTime = this.time.now + durationMs;
  }

  public getGameState(): GameState {
    return {
      isRunning: !this.isGameOver && !this.isVictory,
      isPaused: false,
      lifecycleState: this.isGameOver ? 'GAME_OVER' : this.isVictory ? 'VICTORY' : 'PLAYING',
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      score: this.score,
      lives: this.health,
      currentLevel: this.currentLevel,
      player: {
        x: Math.round(this.player?.x ?? 0),
        y: Math.round(this.player?.y ?? 0),
        velocityX: Math.round(this.player?.body?.velocity.x ?? 0),
        velocityY: Math.round(this.player?.body?.velocity.y ?? 0),
        isGrounded: true,
        isAlive: !this.isGameOver,
      },
      entitiesCount:
        (this.wallsGroup?.countActive() || 0) +
        (this.collectiblesGroup?.countActive() || 0) +
        (this.enemiesGroup?.countActive() || 0),
      elapsedTimeMs: Math.round(this.time.now),
      fps: Math.round(this.game.loop.actualFps || 60),
      collectiblesRemaining: this.collectiblesGroup?.countActive() || 0,
    };
  }
}
