import Phaser from 'phaser';
import { GameSpecification, GameState } from '@shared/core';
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
  private currentScrollSpeed = 240;
  private maxScrollSpeed = 500;
  private isGameOver = false;
  private nextObstacleSpawnTime = 0;
  private groundY = 480;

  private debugGraphics!: Phaser.GameObjects.Graphics;
  public showHitboxes = false;
  public showVectors = false;
  public showGrid = false;

  constructor() {
    super({ key: 'EndlessRunnerScene' });
  }

  init(data: { spec: GameSpecification }) {
    this.spec = data.spec;
    this.score = 0;
    this.distanceTraveled = 0;
    this.currentScrollSpeed = this.spec.runnerConfig?.baseSpeed || 240;
    this.maxScrollSpeed = this.spec.runnerConfig?.maxSpeed || 500;
    this.isGameOver = false;
    this.nextObstacleSpawnTime = 0;
    this.groundY = this.spec.runnerConfig?.groundY || 480;
    this.programmaticAction = null;
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

    // Ground platform spanning screen
    const ground = this.groundGroup.create(width / 2, this.groundY + 20, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
    ground.setDisplaySize(width + 400, 40);
    ground.refreshBody();

    // Player runner placed on the left side
    const pStartX = 140;
    const pStartY = this.groundY - 30;
    this.player = this.physics.add.sprite(pStartX, pStartY, 'player_run_1');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(this.spec.physics.gravityY || 850);
    this.player.setBounce(0);

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

    // Obstacle Overlap / Collision -> Game Over
    this.physics.add.overlap(this.player, this.obstaclesGroup, () => {
      this.handleObstacleHit();
    });

    // Coin Pickups
    this.physics.add.overlap(this.player, this.coinsGroup, (_p, coinObj) => {
      const coin = coinObj as Phaser.Physics.Arcade.Sprite;
      this.score += 50;
      coin.destroy();
      this.game.events.emit('game:state-update', this.getGameState());
    });

    // Keyboard
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      };
    }

    // Schedule initial obstacle
    this.nextObstacleSpawnTime = this.time.now + 1500;

    // Debug Graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    this.game.events.emit('game:ready');
  }

  private handleObstacleHit() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setTint(0xf43f5e);
    this.player.anims.stop();
    this.obstaclesGroup.setVelocityX(0);
    this.coinsGroup.setVelocityX(0);
    this.game.events.emit('game:over', {
      finalScore: this.score + Math.floor(this.distanceTraveled / 10),
      reason: 'Collided with hazard obstacle',
    });
    this.game.events.emit('game:state-update', this.getGameState());
  }

  update(time: number, delta: number) {
    if (this.isGameOver) {
      this.renderDebugVisuals();
      return;
    }

    // Progress distance & scale speed
    this.distanceTraveled += (this.currentScrollSpeed * (delta / 1000));
    const accelRate = this.spec.runnerConfig?.accelerationRate || 1.5;
    this.currentScrollSpeed = Math.min(this.maxScrollSpeed, this.currentScrollSpeed + accelRate * (delta / 1000));

    // Jump Input
    const isGrounded = this.player.body!.blocked.down || this.player.body!.touching.down;
    let jumpPressed =
      (this.cursors && (this.cursors.up.isDown || this.cursors.space.isDown)) ||
      Boolean(this.wasdKeys && (this.wasdKeys['w']?.isDown || this.wasdKeys['space']?.isDown || this.wasdKeys['up']?.isDown));

    if (this.programmaticAction === 'jump' && time < this.programmaticActionEndTime) {
      jumpPressed = true;
    } else if (this.programmaticAction === 'jump') {
      this.programmaticAction = null;
    }

    const jumpVel = this.spec.physics.jumpVelocity || 580;
    if (jumpPressed && isGrounded) {
      this.player.setVelocityY(-jumpVel);
      this.player.setTexture('player_jump');
    }

    if (isGrounded && this.player.anims.currentAnim?.key !== 'runner_run_anim') {
      this.player.play('runner_run_anim');
    }

    // Move existing obstacles & coins leftward at current scroll speed
    this.obstaclesGroup.getChildren().forEach((child) => {
      const obs = child as Phaser.Physics.Arcade.Sprite;
      obs.setVelocityX(-this.currentScrollSpeed);
      if (obs.x < -40) obs.destroy();
    });

    this.coinsGroup.getChildren().forEach((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      coin.setVelocityX(-this.currentScrollSpeed);
      if (coin.x < -40) coin.destroy();
    });

    // Spawn New Obstacles & Coin trails
    if (time > this.nextObstacleSpawnTime) {
      this.spawnObstacleBatch();
      const interval = Math.max(900, 2000 - (this.currentScrollSpeed - 200) * 2.5);
      this.nextObstacleSpawnTime = time + interval;
    }

    this.renderDebugVisuals();
  }

  private spawnObstacleBatch() {
    const { width } = this.scale;
    const spawnX = width + 40;

    // Pick obstacle type: ground spike vs aerial drone
    const isAerial = Math.random() > 0.65;

    if (isAerial) {
      // Flying drone that requires jumping under or ducking
      const droneY = this.groundY - 70;
      const obs = this.obstaclesGroup.create(spawnX, droneY, 'enemy_patrol') as Phaser.Physics.Arcade.Sprite;
      obs.setDisplaySize(24, 24);
      obs.refreshBody();
    } else {
      // Ground spike obstacle
      const obs = this.obstaclesGroup.create(spawnX, this.groundY - 10, 'hazard_spike') as Phaser.Physics.Arcade.Sprite;
      obs.setDisplaySize(24, 20);
      obs.refreshBody();
    }

    // Spawn a 3-coin arc preceding or following the obstacle
    for (let i = 0; i < 3; i++) {
      const coinX = spawnX + 80 + i * 40;
      const coinY = this.groundY - 40 - Math.sin((i / 2) * Math.PI) * 40;
      this.coinsGroup.create(coinX, coinY, 'collectible_coin');
    }
  }

  private renderDebugVisuals() {
    this.debugGraphics.clear();
    const { width, height } = this.scale;

    if (this.showGrid) {
      this.debugGraphics.lineStyle(1, 0xffffff, 0.05);
      for (let x = 0; x < width; x += 40) {
        this.debugGraphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y < height; y += 40) {
        this.debugGraphics.lineBetween(0, y, width, y);
      }
    }

    if (this.showHitboxes && this.player?.body) {
      this.debugGraphics.lineStyle(1.5, 0x10b981, 0.9);
      this.debugGraphics.strokeRect(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);

      this.debugGraphics.lineStyle(1, 0xf43f5e, 0.8);
      this.obstaclesGroup.getChildren().forEach((c) => {
        const body = (c as Phaser.Physics.Arcade.Sprite).body;
        if (body) this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
      });
    }

    if (this.showVectors && this.player?.body) {
      const cx = this.player.x;
      const cy = this.player.y;
      const vy = this.player.body.velocity.y * 0.15;
      this.debugGraphics.lineStyle(2, 0xf59e0b, 1.0);
      this.debugGraphics.lineBetween(cx, cy, cx + this.currentScrollSpeed * 0.1, cy + vy);
    }
  }

  public dispatchAction(action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'stop', durationMs = 200) {
    if (action === 'jump') {
      this.programmaticAction = 'jump';
      this.programmaticActionEndTime = this.time.now + durationMs;
    } else {
      this.programmaticAction = null;
    }
  }

  public getGameState(): GameState {
    const isGrounded = this.player?.body ? (this.player.body.blocked.down || this.player.body.touching.down) : false;
    return {
      isRunning: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      isGameOver: this.isGameOver,
      score: this.score + Math.floor(this.distanceTraveled / 10),
      lives: this.isGameOver ? 0 : 1,
      currentLevel: 1,
      player: {
        x: Math.round(this.player?.x ?? 0),
        y: Math.round(this.player?.y ?? 0),
        velocityX: Math.round(this.currentScrollSpeed),
        velocityY: Math.round(this.player?.body?.velocity.y ?? 0),
        isGrounded,
        isAlive: !this.isGameOver,
      },
      entitiesCount:
        (this.groundGroup?.countActive() || 0) +
        (this.obstaclesGroup?.countActive() || 0) +
        (this.coinsGroup?.countActive() || 0),
      elapsedTimeMs: Math.round(this.time.now),
      fps: Math.round(this.game.loop.actualFps || 60),
    };
  }
}
