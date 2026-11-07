import Phaser from 'phaser';
import { GameSpecification, GameState } from '@shared/core';
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

  // Debug visual graphics
  private debugGraphics!: Phaser.GameObjects.Graphics;
  public showHitboxes = false;
  public showVectors = false;
  public showGrid = false;

  constructor() {
    super({ key: 'TopDownScene' });
  }

  init(data: { spec: GameSpecification }) {
    this.spec = data.spec;
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

    // Background
    this.cameras.main.setBackgroundColor(this.spec.backgroundColor || '#0a0d18');

    // Create Groups
    this.wallsGroup = this.physics.add.staticGroup();
    this.collectiblesGroup = this.physics.add.staticGroup();
    this.enemiesGroup = this.physics.add.group({ allowGravity: false });

    // Build Arena Walls (Outer perimeter + interior maze obstacles)
    const arenaW = this.spec.topDownConfig?.arenaWidth || Math.max(width, 1000);
    const arenaH = this.spec.topDownConfig?.arenaHeight || Math.max(height, 800);

    // Perimeter walls
    this.createWall(arenaW / 2, 12, arenaW, 24); // Top
    this.createWall(arenaW / 2, arenaH - 12, arenaW, 24); // Bottom
    this.createWall(12, arenaH / 2, 24, arenaH); // Left
    this.createWall(arenaW - 12, arenaH / 2, 24, arenaH); // Right

    // Interior walls / Pillars
    const defaultWalls = [
      { x: 280, y: 220, width: 180, height: 28 },
      { x: 540, y: 380, width: 28, height: 200 },
      { x: 280, y: 480, width: 200, height: 28 },
      { x: 700, y: 240, width: 140, height: 28 },
    ];
    const walls = this.spec.topDownConfig?.walls || defaultWalls;
    walls.forEach((w) => this.createWall(w.x, w.y, w.width, w.height));

    // Exit Portal
    const exitX = this.spec.topDownConfig?.exitX || arenaW - 80;
    const exitY = this.spec.topDownConfig?.exitY || 100;
    this.exitPortal = this.physics.add.staticSprite(exitX, exitY, 'finish_portal');

    // Collectibles (Gems)
    const collectibles = this.spec.collectibles || [
      { id: 'gem-1', x: 280, y: 150, type: 'gem' as const, points: 150 },
      { id: 'gem-2', x: 420, y: 340, type: 'gem' as const, points: 150 },
      { id: 'gem-3', x: 680, y: 420, type: 'gem' as const, points: 150 },
      { id: 'gem-4', x: 180, y: 420, type: 'gem' as const, points: 150 },
    ];
    this.totalKeysNeeded = collectibles.length;

    collectibles.forEach((c) => {
      const item = this.collectiblesGroup.create(c.x, c.y, 'collectible_gem') as Phaser.Physics.Arcade.Sprite;
      item.setData('points', c.points);
      item.setData('id', c.id);
    });

    // Enemies (Top-down roaming guards)
    const enemies = this.spec.enemies || [
      { id: 'guard-1', x: 420, y: 180, width: 24, height: 24, type: 'roamer' as const, speed: 70, damage: 1 },
      { id: 'guard-2', x: 620, y: 320, width: 24, height: 24, type: 'roamer' as const, speed: 80, damage: 1 },
    ];

    enemies.forEach((e) => {
      const enemy = this.enemiesGroup.create(e.x, e.y, 'enemy_patrol') as Phaser.Physics.Arcade.Sprite;
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setData('speed', e.speed);
      enemy.setData('damage', e.damage);
      // Give initial diagonal patrol velocity
      const angle = Math.random() * Math.PI * 2;
      enemy.setVelocity(Math.cos(angle) * e.speed, Math.sin(angle) * e.speed);
    });

    // Player
    const startX = this.spec.player?.startX || 80;
    const startY = this.spec.player?.startY || 120;
    this.player = this.physics.add.sprite(startX, startY, 'player_idle');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(200);

    // Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.enemiesGroup, this.wallsGroup);

    // Collectible Overlap
    this.physics.add.overlap(this.player, this.collectiblesGroup, (_p, colObj) => {
      const col = colObj as Phaser.Physics.Arcade.Sprite;
      this.score += (col.getData('points') as number) || 100;
      this.keysCollected += 1;
      col.destroy();
      this.game.events.emit('game:state-update', this.getGameState());
    });

    // Enemy Collision
    this.physics.add.overlap(this.player, this.enemiesGroup, () => {
      this.handleDamage();
    });

    // Exit Portal Overlap
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

    // Camera
    this.cameras.main.setBounds(0, 0, arenaW, arenaH);
    this.physics.world.setBounds(0, 0, arenaW, arenaH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Debug Graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    this.game.events.emit('game:ready');
  }

  private createWall(x: number, y: number, width: number, height: number) {
    const wall = this.wallsGroup.create(x, y, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
    wall.setDisplaySize(width, height);
    wall.refreshBody();
  }

  private handleDamage() {
    if (this.isInvulnerable || this.isGameOver || this.isVictory) return;
    this.health -= 1;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.time.now + 1000;

    if (this.health <= 0) {
      this.isGameOver = true;
      this.player.setTint(0xf43f5e);
      this.player.setVelocity(0, 0);
      this.game.events.emit('game:over', { finalScore: this.score, reason: 'Health depleted by enemy' });
    }
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private handleVictory() {
    if (this.isVictory || this.isGameOver) return;
    this.isVictory = true;
    this.player.setVelocity(0, 0);
    this.game.events.emit('game:victory', { finalScore: this.score });
    this.game.events.emit('game:state-update', this.getGameState());
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

    // Roaming Enemy Steering
    this.enemiesGroup.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const spd = (enemy.getData('speed') as number) || 70;

      // If within 180px, chase player
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (dist < 180 && dist > 10) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      }
    });

    this.renderDebugVisuals();
  }

  private renderDebugVisuals() {
    this.debugGraphics.clear();
    const { width, height } = this.scale;

    if (this.showGrid) {
      this.debugGraphics.lineStyle(1, 0xffffff, 0.05);
      for (let x = 0; x < width * 2; x += 40) {
        this.debugGraphics.lineBetween(x, 0, x, height * 2);
      }
      for (let y = 0; y < height * 2; y += 40) {
        this.debugGraphics.lineBetween(0, y, width * 2, y);
      }
    }

    if (this.showHitboxes && this.player?.body) {
      this.debugGraphics.lineStyle(1.5, 0x10b981, 0.9);
      this.debugGraphics.strokeRect(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);

      this.debugGraphics.lineStyle(1, 0x06b6d4, 0.7);
      this.wallsGroup.getChildren().forEach((c) => {
        const body = (c as Phaser.Physics.Arcade.Sprite).body;
        if (body) this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
      });
    }

    if (this.showVectors && this.player?.body) {
      const cx = this.player.x;
      const cy = this.player.y;
      const vx = this.player.body.velocity.x * 0.15;
      const vy = this.player.body.velocity.y * 0.15;
      this.debugGraphics.lineStyle(2, 0xf59e0b, 1.0);
      this.debugGraphics.lineBetween(cx, cy, cx + vx, cy + vy);
    }
  }

  public dispatchAction(action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'stop', durationMs = 200) {
    if (action === 'stop') {
      this.programmaticAction = null;
      if (this.player?.body) this.player.setVelocity(0, 0);
    } else {
      this.programmaticAction = action;
      this.programmaticActionEndTime = this.time.now + durationMs;
    }
  }

  public getGameState(): GameState {
    return {
      isRunning: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      score: this.score,
      lives: this.health,
      currentLevel: 1,
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
