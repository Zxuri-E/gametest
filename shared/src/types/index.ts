/**
 * Domain types and models shared across Frontend, Backend, Game Engine, and Testing modules.
 */

export type GameGenre = 'platformer' | 'top-down' | 'endless-runner';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type VisualTheme = 'cyberpunk' | 'forest' | 'dungeon' | 'retro-arcade' | 'neon-void';

export type MechanicType =
  | 'player-movement'
  | 'jumping'
  | 'gravity'
  | 'platform-collision'
  | 'enemy-interaction'
  | 'collectibles'
  | 'score-system'
  | 'game-over-condition'
  | 'level-completion';

export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'testing' | 'verified' | 'error';

export interface GameDimensions {
  width: number;
  height: number;
}

export interface GamePhysicsConfig {
  gravityY: number;
  gravityX?: number;
  bounce?: number;
  drag?: number;
  playerSpeed: number;
  jumpVelocity: number;
}

export interface PlayerConfig {
  startX: number;
  startY: number;
  width: number;
  height: number;
  color: string;
  maxLives: number;
  invulnerabilityDurationMs?: number;
}

export interface LevelPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'bouncy' | 'moving' | 'one-way' | 'hazard';
  color?: string;
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface LevelCollectible {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'key' | 'shard';
  points: number;
  color?: string;
}

export interface LevelEnemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'patrol' | 'roamer' | 'static';
  speed: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  damage: number;
  color?: string;
}

export interface LevelObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'laser' | 'pit';
  damage: number;
  color?: string;
}

export interface LevelFinishPoint {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'portal' | 'flag' | 'door';
}

export interface RunnerConfig {
  baseSpeed: number;
  maxSpeed: number;
  accelerationRate: number;
  obstacleIntervalMs: number;
  groundY: number;
  minObstacleGap: number;
  maxObstacleGap: number;
}

export interface TopDownConfig {
  arenaWidth: number;
  arenaHeight: number;
  walls: { x: number; y: number; width: number; height: number }[];
  exitX: number;
  exitY: number;
}

export interface ReachabilityMetrics {
  maxJumpHeight: number; // h = v^2 / (2g)
  timeToApex: number;    // t = v / g
  totalAirTime: number;  // 2 * t
  maxJumpDistance: number; // playerSpeed * totalAirTime
  isReachable: boolean;
  warnings?: string[];
}

export interface GameSpecification {
  id: string;
  title: string;
  genre: GameGenre;
  prompt: string;
  dimensions: GameDimensions;
  difficulty: DifficultyLevel;
  theme?: VisualTheme;
  mechanics: MechanicType[];
  physics: GamePhysicsConfig;
  player?: PlayerConfig;
  platforms?: LevelPlatform[];
  collectibles?: LevelCollectible[];
  enemies?: LevelEnemy[];
  obstacles?: LevelObstacle[];
  finishPoint?: LevelFinishPoint;
  runnerConfig?: RunnerConfig;
  topDownConfig?: TopDownConfig;
  reachability?: ReachabilityMetrics;
  targetFPS: number;
  backgroundColor: string;
  createdFromPrompt: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  currentVersion: string;
  genre: GameGenre;
  specification: GameSpecification;
  createdAt: string;
  updatedAt: string;
  totalRuns: number;
  testsPassed: number;
  testsFailed: number;
  openBugsCount: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver?: boolean;
  isVictory?: boolean;
  score: number;
  lives: number;
  currentLevel: number;
  player: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    isGrounded: boolean;
    isAlive: boolean;
  };
  entitiesCount: number;
  elapsedTimeMs: number;
  fps: number;
  collectiblesRemaining?: number;
}

/**
 * Programmatic interface for automated test drivers (Playwright / AI playtester)
 * to interact with a running 2D game instance.
 */
export interface GameTestAPI {
  getGameState(): Promise<GameState>;
  dispatchAction(action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'stop', durationMs?: number): Promise<void>;
  simulateCollision(entityA: string, entityB: string): Promise<boolean>;
  restartGame(): Promise<void>;
  pauseGame(): Promise<void>;
  resumeGame(): Promise<void>;
  captureScreenshot(): Promise<string>;
  getCollisionMatrix(): Promise<Record<string, string[]>>;
  getPlayerPosition(): Promise<{ x: number; y: number; vx: number; vy: number; isGrounded: boolean }>;
  getEntitiesSummary(): Promise<{ platforms: number; collectibles: number; enemies: number; obstacles: number }>;
}

/**
 * Extensible adapter interface for Phaser 3 or future external 2D game runtimes.
 */
export interface GameRuntimeAdapter {
  id: string;
  engineName: 'phaser-3' | 'custom-canvas' | 'external-adapter';
  version: string;
  mount(container: HTMLElement, spec: GameSpecification): Promise<void>;
  unmount(): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  loadSpecification(spec: GameSpecification): Promise<void>;
  getTestAPI(): GameTestAPI;
}

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestAssertion {
  id: string;
  description: string;
  expected: string;
  actual?: string;
  passed: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  mechanic: MechanicType;
  status: TestStatus;
  durationMs?: number;
  assertions: TestAssertion[];
  errorMessage?: string;
  screenshotUrl?: string;
  timestamp?: string;
}

export interface TestResult {
  runId: string;
  projectId: string;
  projectVersion: string;
  startedAt: string;
  finishedAt: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  tests: TestCase[];
  overallStatus: 'passed' | 'failed';
  browserLogs?: string[];
}

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';

export type BugCategory = 'physics' | 'collision' | 'logic' | 'level-reachability' | 'game-loop' | 'state' | 'render';

export type BugRepairStatus = 'open' | 'diagnosing' | 'patch-in-progress' | 'verified-fixed' | 'rejected';

export interface BugReport {
  id: string;
  projectId: string;
  projectVersion: string;
  title: string;
  severity: BugSeverity;
  category: BugCategory;
  affectedMechanic: MechanicType;
  expectedBehaviour: string;
  actualBehaviour: string;
  suspectedSourceLocation: {
    file: string;
    line: number;
    symbol?: string;
    snippet?: string;
  };
  evidence: {
    testCaseId?: string;
    failedAssertion?: string;
    consoleLogs?: string[];
    traceUrl?: string;
    screenshotUrl?: string;
  };
  repairStatus: BugRepairStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RepairIteration {
  id: string;
  bugReportId: string;
  projectId: string;
  iterationNumber: number;
  description: string;
  diffPatch: string;
  affectedFiles: string[];
  appliedTimestamp?: string;
  testRunResultId?: string;
  isSuccessful: boolean;
  verificationLogs?: string[];
  createdAt: string;
}

export type AgentRole = 'generator' | 'test-planner' | 'playtester' | 'diagnostician' | 'repair';

export type AgentState = 'idle' | 'analyzing' | 'synthesizing' | 'executing' | 'completed' | 'error';

export interface AgentStatus {
  role: AgentRole;
  state: AgentState;
  currentTask?: string;
  progressPercentage?: number;
  lastMessage?: string;
  timestamp: string;
}

export interface ProjectExportData {
  projectId: string;
  projectName: string;
  version: string;
  genre: GameGenre;
  specification: GameSpecification;
  standaloneHtml: string;
  readme: string;
  exportedAt: string;
  fileName?: string;
  fileSizeBytes?: number;
}
