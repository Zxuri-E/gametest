import Phaser from 'phaser';
import { GameSpecification, GameState, LevelPlatform } from '@shared/core';
import { generateProceduralTextures } from '../assets/textureGenerator';

export class PlatformerScene extends Phaser.Scene {
  private spec!: GameSpecification;
  private player!: Phaser.Physics.Arcade.Sprite;
  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private collectiblesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private hazardsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private finishPortal?: Phaser.GameObjects.Sprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private programmaticAction: string | null = null;
  private programmaticActionEndTime = 0;

  private score = 0;
  private lives = 3;
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
    super({ key: 'PlatformerScene' });
  }

  init(data: { spec: GameSpecification; levelIndex?: number }) {
    this.spec = data?.spec || {};
    this.currentLevel = data?.levelIndex || 1;
    this.score = 0;
    this.lives = this.spec.player?.maxLives ?? 3;
    this.isGameOver = false;
    this.isVictory = false;
    this.isInvulnerable = false;
    this.programmaticAction = null;
  }

  preload() {
    generateProceduralTextures(this, this.spec.theme || 'cyberpunk');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor(this.spec.backgroundColor || '#070a14');

    // Create Animations
    if (!this.anims.exists('player_run_anim')) {
      this.anims.create({
        key: 'player_run_anim',
        frames: [{ key: 'player_run_1' }, { key: 'player_run_2' }],
        frameRate: 8,
        repeat: -1,
      });
    }

    // Static Platforms Group
    this.platformsGroup = this.physics.add.staticGroup();
    this.movingPlatformsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.hazardsGroup = this.physics.add.staticGroup();
    this.collectiblesGroup = this.physics.add.staticGroup();
    this.enemiesGroup = this.physics.add.group({ allowGravity: true });

    // Spawn configured platforms or defaults
    const platforms = this.spec.platforms && this.spec.platforms.length > 0
      ? this.spec.platforms
      : this.getDefaultPlatforms(width, height);

    platforms.forEach((plat) => {
      this.createPlatform(plat);
    });

    // Spawn Collectibles
    const collectibles = this.spec.collectibles && this.spec.collectibles.length > 0
      ? this.spec.collectibles
      : this.getDefaultCollectibles(platforms);

    collectibles.forEach((c) => {
      const col = this.collectiblesGroup.create(c.x, c.y, 'collectible_gem') as Phaser.Physics.Arcade.Sprite;
      col.setData('points', c.points || 100);
      col.setData('id', c.id);
      // Subtle float animation
      this.tweens.add({
        targets: col,
        y: c.y - 6,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Spawn Enemies
    const enemies = this.spec.enemies && this.spec.enemies.length > 0
      ? this.spec.enemies
      : this.getDefaultEnemies(platforms);

    enemies.forEach((e) => {
      const enemySprite = this.enemiesGroup.create(e.x, e.y, 'enemy_patrol') as Phaser.Physics.Arcade.Sprite;
      enemySprite.setCollideWorldBounds(true);
      enemySprite.setBounce(0.1);
      enemySprite.setData('minX', e.minX ?? e.x - 60);
      enemySprite.setData('maxX', e.maxX ?? e.x + 60);
      enemySprite.setData('speed', e.speed || 60);
      enemySprite.setData('damage', e.damage || 1);
      enemySprite.setVelocityX(e.speed || 60);
    });

    // Spawn Finish Goal
    const finishPos = this.spec.finishPoint || { x: width - 60, y: height - 140, width: 36, height: 48, type: 'portal' };
    this.finishPortal = this.add.sprite(finishPos.x, finishPos.y, 'finish_portal');
    this.physics.add.existing(this.finishPortal, true);

    // Spawn Player
    const pStartX = this.spec.player?.startX ?? 80;
    const pStartY = this.spec.player?.startY ?? height - 160;
    this.player = this.physics.add.sprite(pStartX, pStartY, 'player_idle');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(this.spec.physics.bounce ?? 0.05);
    this.player.setDragX(this.spec.physics.drag ?? 120);

    const gravY = this.spec.physics.gravityY ?? 800;
    this.player.setGravityY(gravY);

    // Collisions
    this.physics.add.collider(this.player, this.platformsGroup);
    this.physics.add.collider(this.player, this.movingPlatformsGroup);
    this.physics.add.collider(this.enemiesGroup, this.platformsGroup);
    this.physics.add.collider(this.enemiesGroup, this.movingPlatformsGroup);

    // Collectibles Overlap
    this.physics.add.overlap(this.player, this.collectiblesGroup, (_p, colObj) => {
      this.handleCollect(colObj as Phaser.Physics.Arcade.Sprite);
    });

    // Enemy Collisions
    this.physics.add.overlap(this.player, this.enemiesGroup, (_p, enemyObj) => {
      this.handleEnemyCollision(enemyObj as Phaser.Physics.Arcade.Sprite);
    });

    // Hazard Collisions
    this.physics.add.overlap(this.player, this.hazardsGroup, () => {
      this.handleHazardHit();
    });

    // Victory Overlap
    if (this.finishPortal) {
      this.physics.add.overlap(this.player, this.finishPortal, () => {
        this.handleVictory();
      });
    }

    // Input Keys
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }

    // Camera
    this.cameras.main.setBounds(0, 0, Math.max(width, 1600), height);
    this.physics.world.setBounds(0, 0, Math.max(width, 1600), height + 100);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Debug Graphics Layer
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    // Cleanup on scene shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.debugGraphics) {
        this.debugGraphics.clear();
      }
    });

    // Emit Engine Ready
    this.game.events.emit('game:ready');
  }

  private createPlatform(plat: LevelPlatform) {
    if (plat.type === 'moving') {
      const p = this.movingPlatformsGroup.create(plat.x + plat.width / 2, plat.y + plat.height / 2, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
      p.setDisplaySize(plat.width, plat.height);
      p.refreshBody();
      const maxX = plat.maxX ?? plat.x + 160;
      this.tweens.add({
        targets: p,
        x: maxX + plat.width / 2,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (plat.type === 'hazard') {
      const h = this.hazardsGroup.create(plat.x + plat.width / 2, plat.y + plat.height / 2, 'hazard_spike') as Phaser.Physics.Arcade.Sprite;
      h.setDisplaySize(plat.width, plat.height);
      h.refreshBody();
    } else {
      const p = this.platformsGroup.create(plat.x + plat.width / 2, plat.y + plat.height / 2, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
      p.setDisplaySize(plat.width, plat.height);
      p.refreshBody();
    }
  }

  private handleCollect(col: Phaser.Physics.Arcade.Sprite) {
    const pts = (col.getData('points') as number) || 100;
    this.score += pts;
    this.createSparkBurst(col.x, col.y, 0x22d3ee);
    col.destroy();
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private handleEnemyCollision(enemy: Phaser.Physics.Arcade.Sprite) {
    if (this.isInvulnerable || this.isGameOver || this.isVictory) return;

    // Check if player lands on top of enemy (stomp)
    const playerBottom = this.player.y + this.player.height / 2;
    const enemyTop = enemy.y - enemy.height / 2;

    if (playerBottom <= enemyTop + 14 && this.player.body!.velocity.y > 0) {
      // Squashed enemy!
      this.score += 250;
      this.createSparkBurst(enemy.x, enemy.y, 0xf43f5e);
      enemy.destroy();
      this.player.setVelocityY(-(this.spec.physics.jumpVelocity || 550) * 0.7);
    } else {
      // Player takes damage
      this.lives -= 1;
      this.isInvulnerable = true;
      this.invulnerableTimer = this.time.now + (this.spec.player?.invulnerabilityDurationMs || 1000);

      // Knockback
      const knockDir = this.player.x < enemy.x ? -1 : 1;
      this.player.setVelocityX(knockDir * 200);
      this.player.setVelocityY(-250);

      if (this.lives <= 0) {
        this.triggerGameOver('Eliminated by enemy hazard');
      }
    }
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private handleHazardHit() {
    if (this.isInvulnerable || this.isGameOver || this.isVictory) return;
    this.lives -= 1;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.time.now + 1000;
    this.player.setVelocityY(-300);

    if (this.lives <= 0) {
      this.triggerGameOver('Fell into hazard');
    }
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private handleVictory() {
    if (this.isVictory || this.isGameOver) return;
    this.isVictory = true;
    this.player.setVelocity(0, 0);
    this.createSparkBurst(this.player.x, this.player.y, 0x10b981);
    this.game.events.emit('game:victory', { finalScore: this.score });
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private triggerGameOver(reason: string) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setTint(0xf43f5e);
    this.player.setVelocity(0, 0);
    this.game.events.emit('game:over', { finalScore: this.score, reason });
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private createSparkBurst(x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(x, y, 3, color);
      this.physics.add.existing(spark);
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 90;
      (spark.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.1,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }
  }

  update(time: number, _delta: number) {
    if (this.isGameOver || this.isVictory) {
      this.renderDebugVisuals();
      return;
    }

    // Invulnerability blink effect
    if (this.isInvulnerable) {
      this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.3 : 1);
      if (time > this.invulnerableTimer) {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      }
    }

    // Pitfall boundary death
    if (this.player.y > this.scale.height + 40) {
      this.triggerGameOver('Fell into pit');
      return;
    }

    // Enemy Patrol Update
    this.enemiesGroup.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const minX = enemy.getData('minX') as number;
      const maxX = enemy.getData('maxX') as number;
      const speed = (enemy.getData('speed') as number) || 60;

      if (enemy.x <= minX) {
        enemy.setVelocityX(speed);
      } else if (enemy.x >= maxX) {
        enemy.setVelocityX(-speed);
      }
    });

    // Horizontal Movement
    const speed = this.spec.physics.playerSpeed || 280;
    const jumpVelocity = this.spec.physics.jumpVelocity || 550;
    const isGrounded = this.player.body!.blocked.down || this.player.body!.touching.down;

    let moveLeft = Boolean((this.cursors && this.cursors.left.isDown) || (this.wasdKeys && this.wasdKeys['a']?.isDown));
    let moveRight = Boolean((this.cursors && this.cursors.right.isDown) || (this.wasdKeys && this.wasdKeys['d']?.isDown));
    let jumpPressed = Boolean((this.cursors && this.cursors.up.isDown) || (this.wasdKeys && (this.wasdKeys['w']?.isDown || this.wasdKeys['space']?.isDown)));

    // Handle programmatic input from GameTestAPI
    if (this.programmaticAction) {
      if (time < this.programmaticActionEndTime) {
        if (this.programmaticAction === 'left') moveLeft = true;
        if (this.programmaticAction === 'right') moveRight = true;
        if (this.programmaticAction === 'jump') jumpPressed = true;
      } else {
        this.programmaticAction = null;
      }
    }

    if (moveLeft) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      if (isGrounded) this.player.anims.play('player_run_anim', true);
    } else if (moveRight) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      if (isGrounded) this.player.anims.play('player_run_anim', true);
    } else {
      this.player.setVelocityX(0);
      if (isGrounded) this.player.setTexture('player_idle');
    }

    // Jumping Mechanics: Variable Jump Height
    if (jumpPressed && isGrounded) {
      this.player.setVelocityY(-jumpVelocity);
      this.player.setTexture('player_jump');
    }

    if (!isGrounded) {
      this.player.setTexture('player_jump');
      // If user releases jump while ascending, reduce velocity for responsive jump arcs
      if (!jumpPressed && this.player.body!.velocity.y < -100) {
        this.player.setVelocityY(this.player.body!.velocity.y * 0.85);
      }
    }

    this.renderDebugVisuals();
  }

  private renderDebugVisuals() {
    this.debugGraphics.clear();
    const { width, height } = this.scale;

    // Coordinate Grid
    if (this.showGrid) {
      this.debugGraphics.lineStyle(1, 0xffffff, 0.05);
      for (let x = 0; x < width * 2; x += 40) {
        this.debugGraphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y < height; y += 40) {
        this.debugGraphics.lineBetween(0, y, width * 2, y);
      }
    }

    // Hitboxes (AABB)
    if (this.showHitboxes && this.player && this.player.body) {
      this.debugGraphics.lineStyle(1.5, 0x10b981, 0.9);
      this.debugGraphics.strokeRect(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);

      this.debugGraphics.lineStyle(1, 0x06b6d4, 0.7);
      this.platformsGroup.getChildren().forEach((c) => {
        const body = (c as Phaser.Physics.Arcade.Sprite).body;
        if (body) this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
      });

      this.debugGraphics.lineStyle(1, 0xf43f5e, 0.8);
      this.enemiesGroup.getChildren().forEach((c) => {
        const body = (c as Phaser.Physics.Arcade.Sprite).body;
        if (body) this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
      });
    }

    // Velocity Vectors
    if (this.showVectors && this.player && this.player.body) {
      const cx = this.player.x;
      const cy = this.player.y;
      const vx = this.player.body.velocity.x * 0.15;
      const vy = this.player.body.velocity.y * 0.15;

      this.debugGraphics.lineStyle(2, 0xf59e0b, 1.0);
      this.debugGraphics.lineBetween(cx, cy, cx + vx, cy + vy);
      this.debugGraphics.fillStyle(0xf59e0b, 1.0);
      this.debugGraphics.fillCircle(cx + vx, cy + vy, 3);
    }
  }

  // --- Programmatic Test API Hooks ---
  public dispatchAction(action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'stop', durationMs = 200) {
    if (action === 'stop') {
      this.programmaticAction = null;
      if (this.player && this.player.body) this.player.setVelocityX(0);
    } else {
      this.programmaticAction = action;
      this.programmaticActionEndTime = this.time.now + durationMs;
    }
  }

  public getGameState(): GameState {
    const isGrounded = this.player?.body ? (this.player.body.blocked.down || this.player.body.touching.down) : false;
    return {
      isRunning: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      lifecycleState: this.isGameOver ? 'GAME_OVER' : this.isVictory ? 'VICTORY' : 'PLAYING',
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      score: this.score,
      lives: this.lives,
      currentLevel: this.currentLevel,
      seed: this.spec.seed,
      player: {
        x: Math.round(this.player?.x ?? 0),
        y: Math.round(this.player?.y ?? 0),
        velocityX: Math.round(this.player?.body?.velocity.x ?? 0),
        velocityY: Math.round(this.player?.body?.velocity.y ?? 0),
        isGrounded,
        isAlive: !this.isGameOver,
      },
      entitiesCount:
        (this.platformsGroup?.countActive() || 0) +
        (this.collectiblesGroup?.countActive() || 0) +
        (this.enemiesGroup?.countActive() || 0),
      elapsedTimeMs: Math.round(this.time.now),
      fps: Math.round(this.game.loop.actualFps || 60),
      collectiblesRemaining: this.collectiblesGroup?.countActive() || 0,
    };
  }

  // Default fallback platform layout if not specified
  private getDefaultPlatforms(width: number, height: number): LevelPlatform[] {
    return [
      { id: 'ground', x: 0, y: height - 40, width: Math.max(width, 1600), height: 40, type: 'solid' },
      { id: 'plat-1', x: 160, y: height - 130, width: 140, height: 20, type: 'solid' },
      { id: 'plat-2', x: 380, y: height - 210, width: 150, height: 20, type: 'solid' },
      { id: 'plat-3', x: 610, y: height - 280, width: 140, height: 20, type: 'moving', minX: 580, maxX: 720 },
      { id: 'plat-4', x: 840, y: height - 200, width: 160, height: 20, type: 'solid' },
      { id: 'plat-goal', x: width - 120, y: height - 120, width: 120, height: 20, type: 'solid' },
    ];
  }

  private getDefaultCollectibles(platforms: LevelPlatform[]) {
    return platforms.slice(1).map((p, idx) => ({
      id: `shard-${idx + 1}`,
      x: p.x + p.width / 2,
      y: p.y - 28,
      type: 'gem' as const,
      points: 100,
    }));
  }

  private getDefaultEnemies(platforms: LevelPlatform[]) {
    if (platforms.length <= 2) return [];
    const p = platforms[2]!;
    return [
      {
        id: 'enemy-1',
        x: p.x + p.width / 2,
        y: p.y - 20,
        width: 24,
        height: 24,
        type: 'patrol' as const,
        speed: 60,
        minX: p.x + 10,
        maxX: p.x + p.width - 10,
        damage: 1,
      },
    ];
  }
}
