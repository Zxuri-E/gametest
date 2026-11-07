import Phaser from 'phaser';
import { GameSpecification, GameState, SeededRandom } from '@shared/core';
import { generateProceduralTextures } from '../assets/textureGenerator';

export class EndlessRunnerScene extends Phaser.Scene {
  private spec!: GameSpecification;
  private player!: Phaser.Physics.Arcade.Sprite;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private obstaclesGroup!: Phaser.Physics.Arcade.Group;
  private coinsGroup!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private programmaticAction: string | null = null;
  private programmaticActionEndTime = 0;

  private score = 0;
  private distanceTraveled = 0;
  private currentScrollSpeed = 260;
  private maxScrollSpeed = 540;
  private isGameOver = false;
  private isSliding = false;
  private isInvulnerable = false;
  private invulnerableTimer = 0;
  private lives = 3;
  private nextObstacleSpawnTime = 0;
  private groundY = 480;

  private rng!: SeededRandom;
  private roadTiles: Phaser.GameObjects.Image[] = [];

  private debugGraphics!: Phaser.GameObjects.Graphics;
  public showHitboxes = false;
  public showVectors = false;
  public showGrid = false;

  constructor() {
    super({ key: 'EndlessRunnerScene' });
  }

  init(data: { spec: GameSpecification; levelIndex?: number }) {
    this.spec = data?.spec || {};
    this.score = 0;
    this.distanceTraveled = 0;
    this.currentScrollSpeed = this.spec.runnerConfig?.baseSpeed || 260;
    this.maxScrollSpeed = this.spec.runnerConfig?.maxSpeed || 540;
    this.isGameOver = false;
    this.isSliding = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.lives = this.spec.player?.maxLives ?? 3;
    this.nextObstacleSpawnTime = 0;
    this.groundY = this.spec.runnerConfig?.groundY || 480;
    this.programmaticAction = null;
    this.rng = new SeededRandom(this.spec.seed || `runner-${Date.now()}`);
  }

  preload() {
    generateProceduralTextures(this, this.spec.theme || 'retro-arcade');
  }

  create() {
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor(this.spec.backgroundColor || '#09090b');

    // Create groups
    this.groundGroup = this.physics.add.staticGroup();
    this.obstaclesGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.coinsGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    // Scrolling Highway Ground Tiles
    this.roadTiles = [];
    for (let x = 0; x < width + 128; x += 64) {
      const tile = this.add.image(x, this.groundY + 20, 'runner_ground').setDepth(2);
      this.roadTiles.push(tile);
    }

    // Static invisible collision floor for physics support
    const groundCollider = this.groundGroup.create(width / 2, this.groundY + 20, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
    groundCollider.setDisplaySize(width + 400, 40);
    groundCollider.setVisible(false);
    groundCollider.refreshBody();

    // Player runner placed on the left side
    const pStartX = 140;
    const pStartY = this.groundY - 30;
    this.player = this.physics.add.sprite(pStartX, pStartY, 'player_run_1');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(this.spec.physics?.gravityY || 850);
    this.player.setBounce(0);
    this.player.setSize(22, 32);
    this.player.setOffset(3, 2);
    this.player.setDepth(10);

    // Run animation
    if (!this.anims.exists('runner_run_anim')) {
      this.anims.create({
        key: 'runner_run_anim',
        frames: [{ key: 'player_run_1' }, { key: 'player_run_2' }],
        frameRate: 10,
        repeat: -1,
      });
    }
    this.player.play('runner_run_anim');

    // Colliders
    this.physics.add.collider(this.player, this.groundGroup);

    // Obstacle Overlap / Collision
    this.physics.add.overlap(this.player, this.obstaclesGroup, () => {
      this.handleObstacleHit();
    });

    // Coin Pickups
    this.physics.add.overlap(this.player, this.coinsGroup, (_p, coinObj) => {
      const coin = coinObj as Phaser.Physics.Arcade.Sprite;
      this.score += 75;
      this.createSparkBurst(coin.x, coin.y, 0x38bdf8);
      coin.destroy();
      this.game.events.emit('game:state-update', this.getGameState());
    });

    // Keyboard Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      };
    }

    // Schedule initial obstacle spawn
    this.nextObstacleSpawnTime = this.time.now + 1200;

    // Debug Graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    // Shutdown cleanup
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.debugGraphics) {
        this.debugGraphics.clear();
      }
    });

    this.game.events.emit('game:ready');
  }

  private handleObstacleHit() {
    if (this.isGameOver || this.isInvulnerable) return;

    this.lives -= 1;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.time.now + 1200;
    this.createSparkBurst(this.player.x, this.player.y, 0xf43f5e);

    if (this.lives <= 0) {
      this.isGameOver = true;
      this.player.setTint(0xf43f5e);
      this.player.anims.stop();
      this.obstaclesGroup.setVelocityX(0);
      this.coinsGroup.setVelocityX(0);
      this.game.events.emit('game:over', {
        finalScore: this.score + Math.floor(this.distanceTraveled / 10),
        distance: Math.round(this.distanceTraveled),
        reason: 'Collided with hazard obstacle',
      });
    }
    this.game.events.emit('game:state-update', this.getGameState());
  }

  private createSparkBurst(x: number, y: number, color: number) {
    for (let i = 0; i < 5; i++) {
      const spark = this.add.image(x, y, 'particle_spark');
      spark.setTint(color);
      spark.setDepth(50);
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 20;
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 300,
        onComplete: () => spark.destroy(),
      });
    }
  }

  update(time: number, delta: number) {
    if (this.isGameOver) {
      this.renderDebugVisuals();
      return;
    }

    // Scroll road tiles
    const scrollDelta = this.currentScrollSpeed * (delta / 1000);
    this.distanceTraveled += scrollDelta;
    this.roadTiles.forEach((tile) => {
      tile.x -= scrollDelta;
      if (tile.x < -32) {
        tile.x += this.roadTiles.length * 64;
      }
    });

    // Speed progression curve
    const accelRate = this.spec.runnerConfig?.accelerationRate || 2.0;
    this.currentScrollSpeed = Math.min(this.maxScrollSpeed, this.currentScrollSpeed + accelRate * (delta / 1000));

    // Invulnerability visual flash
    if (this.isInvulnerable) {
      this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.3 : 1);
      if (time > this.invulnerableTimer) {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      }
    }

    const isGrounded = this.player.body!.blocked.down || this.player.body!.touching.down;

    // Controls: Jump & Slide/Dodge
    let jumpPressed =
      (this.cursors && (this.cursors.up.isDown || this.cursors.space.isDown)) ||
      Boolean(this.wasdKeys && (this.wasdKeys['w']?.isDown || this.wasdKeys['space']?.isDown || this.wasdKeys['up']?.isDown));

    let slidePressed =
      (this.cursors && this.cursors.down.isDown) ||
      Boolean(this.wasdKeys && (this.wasdKeys['s']?.isDown || this.wasdKeys['down']?.isDown));

    if (this.programmaticAction === 'jump' && time < this.programmaticActionEndTime) {
      jumpPressed = true;
    } else if (this.programmaticAction === 'down' && time < this.programmaticActionEndTime) {
      slidePressed = true;
    } else if (this.programmaticAction) {
      this.programmaticAction = null;
    }

    // Slide Mechanic: Crouch down with low hitbox to slide under aerial barriers
    if (slidePressed && isGrounded) {
      if (!this.isSliding) {
        this.isSliding = true;
        this.player.setTexture('player_slide');
        this.player.setSize(28, 16);
        this.player.setOffset(2, 16);
      }
    } else if (this.isSliding) {
      this.isSliding = false;
      this.player.setSize(22, 32);
      this.player.setOffset(3, 2);
      if (isGrounded) {
        this.player.play('runner_run_anim');
      }
    }

    // Jump Mechanic: Launch upward with jumpVelocity
    const jumpVel = this.spec.physics?.jumpVelocity || 580;
    if (jumpPressed && isGrounded && !this.isSliding) {
      this.player.setVelocityY(-jumpVel);
      this.player.setTexture('player_jump');
    }

    if (isGrounded && !this.isSliding && this.player.anims.currentAnim?.key !== 'runner_run_anim') {
      this.player.play('runner_run_anim');
    }

    // Move obstacles and collectibles leftward
    this.obstaclesGroup.getChildren().forEach((child) => {
      const obs = child as Phaser.Physics.Arcade.Sprite;
      obs.setVelocityX(-this.currentScrollSpeed);
      if (obs.x < -60) obs.destroy();
    });

    this.coinsGroup.getChildren().forEach((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      coin.setVelocityX(-this.currentScrollSpeed);
      if (coin.x < -60) coin.destroy();
    });

    // Seeded procedural obstacle spawning
    if (time > this.nextObstacleSpawnTime) {
      this.spawnSeededObstacleBatch();
      const interval = Math.max(950, 2200 - (this.currentScrollSpeed - 240) * 2.2);
      this.nextObstacleSpawnTime = time + interval;
    }

    this.renderDebugVisuals();
  }

  private spawnSeededObstacleBatch() {
    const { width } = this.scale;
    const spawnX = width + 60;

    // Use seeded PRNG for deterministic pattern selection
    const patternRoll = this.rng.next();

    if (patternRoll < 0.45) {
      // Ground Obstacle: Laser barrier or spike -> Requires JUMP
      const obs = this.obstaclesGroup.create(spawnX, this.groundY - 18, 'hazard_spike') as Phaser.Physics.Arcade.Sprite;
      obs.setDisplaySize(24, 24);
      obs.refreshBody();
      obs.setDepth(5);

      // Trailing coin above obstacle for rewarding safe jump apex
      const coin = this.coinsGroup.create(spawnX, this.groundY - 80, 'collectible_coin') as Phaser.Physics.Arcade.Sprite;
      coin.setDisplaySize(18, 18);
      coin.setDepth(6);
    } else if (patternRoll < 0.75) {
      // High Aerial Drone -> Requires SLIDE / DUCK
      const droneY = this.groundY - 55;
      const drone = this.obstaclesGroup.create(spawnX, droneY, 'enemy_patrol') as Phaser.Physics.Arcade.Sprite;
      drone.setDisplaySize(28, 28);
      drone.refreshBody();
      drone.setDepth(5);

      // Coins underneath drone rewarding successful slide
      const coin = this.coinsGroup.create(spawnX, this.groundY - 12, 'collectible_gem') as Phaser.Physics.Arcade.Sprite;
      coin.setDisplaySize(18, 18);
      coin.setDepth(6);
    } else {
      // Dual coin trail safe run
      for (let i = 0; i < 3; i++) {
        const coin = this.coinsGroup.create(spawnX + i * 40, this.groundY - 24, 'collectible_coin') as Phaser.Physics.Arcade.Sprite;
        coin.setDisplaySize(18, 18);
        coin.setDepth(6);
      }
    }
  }

  private renderDebugVisuals() {
    this.debugGraphics.clear();
    if (!this.showHitboxes && !this.showVectors && !this.showGrid) return;

    if (this.showGrid) {
      this.debugGraphics.lineStyle(1, 0x1e293b, 0.4);
      const { width, height } = this.scale;
      for (let x = 0; x < width; x += 40) {
        this.debugGraphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y < height; y += 40) {
        this.debugGraphics.lineBetween(0, y, width, y);
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

      this.debugGraphics.lineStyle(1, 0xf43f5e, 0.9);
      this.obstaclesGroup.getChildren().forEach((o) => {
        const obs = o as Phaser.Physics.Arcade.Sprite;
        this.debugGraphics.strokeRect(obs.body!.x, obs.body!.y, obs.body!.width, obs.body!.height);
      });
    }

    if (this.showVectors && this.player) {
      this.debugGraphics.lineStyle(2, 0xf59e0b, 1);
      this.debugGraphics.lineBetween(
        this.player.x,
        this.player.y,
        this.player.x,
        this.player.y + this.player.body!.velocity.y * 0.15
      );
    }
  }

  public dispatchAction(action: string, durationMs = 200) {
    this.programmaticAction = action;
    this.programmaticActionEndTime = this.time.now + durationMs;
  }

  public getGameState(): GameState {
    const isGrounded = this.player?.body ? this.player.body.blocked.down || this.player.body.touching.down : false;
    return {
      isRunning: !this.isGameOver,
      isPaused: false,
      lifecycleState: this.isGameOver ? 'GAME_OVER' : 'PLAYING',
      isGameOver: this.isGameOver,
      score: this.score + Math.floor(this.distanceTraveled / 10),
      lives: this.lives,
      currentLevel: 1,
      seed: this.spec.seed,
      distanceTraveled: Math.round(this.distanceTraveled),
      player: {
        x: Math.round(this.player?.x ?? 0),
        y: Math.round(this.player?.y ?? 0),
        velocityX: Math.round(this.currentScrollSpeed),
        velocityY: Math.round(this.player?.body?.velocity.y ?? 0),
        isGrounded,
        isAlive: !this.isGameOver,
      },
      entitiesCount: this.obstaclesGroup?.countActive() || 0,
      elapsedTimeMs: Math.round(this.time.now),
      fps: Math.round(this.game.loop.actualFps || 60),
    };
  }
}
