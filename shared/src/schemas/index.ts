import { z } from 'zod';

export const GameGenreSchema = z.enum(['platformer', 'top-down', 'endless-runner']);

export const DifficultyLevelSchema = z.enum(['easy', 'medium', 'hard']);

export const VisualThemeSchema = z.enum(['cyberpunk', 'forest', 'dungeon', 'retro-arcade', 'neon-void']);

export const MechanicTypeSchema = z.enum([
  'player-movement',
  'jumping',
  'gravity',
  'platform-collision',
  'enemy-interaction',
  'collectibles',
  'score-system',
  'game-over-condition',
  'level-completion',
]);

export const GameDimensionsSchema = z.object({
  width: z.number().int().min(320).max(1920).default(800),
  height: z.number().int().min(240).max(1080).default(600),
});

export const GamePhysicsConfigSchema = z.object({
  gravityY: z.number().default(800),
  gravityX: z.number().optional().default(0),
  bounce: z.number().min(0).max(1).optional().default(0.1),
  drag: z.number().min(0).optional().default(100),
  playerSpeed: z.number().min(50).max(1000).default(300),
  jumpVelocity: z.number().min(0).max(1200).default(550),
});

export const LevelPlatformSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  type: z.enum(['solid', 'bouncy', 'moving', 'one-way', 'hazard']).default('solid'),
  color: z.string().optional(),
  vx: z.number().optional(),
  minX: z.number().optional(),
  maxX: z.number().optional(),
});

export const LevelCollectibleSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  type: z.enum(['coin', 'gem', 'key', 'shard']).default('coin'),
  points: z.number().int().default(100),
  color: z.string().optional(),
});

export const LevelEnemySchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive().default(24),
  height: z.number().positive().default(24),
  type: z.enum(['patrol', 'roamer', 'static']).default('patrol'),
  speed: z.number().default(60),
  minX: z.number().optional(),
  maxX: z.number().optional(),
  minY: z.number().optional(),
  maxY: z.number().optional(),
  damage: z.number().int().default(1),
  color: z.string().optional(),
});

export const LevelObstacleSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  type: z.enum(['spike', 'laser', 'pit']),
  damage: z.number().int().default(1),
  color: z.string().optional(),
});

export const LevelFinishPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive().default(32),
  height: z.number().positive().default(48),
  type: z.enum(['portal', 'flag', 'door']).default('portal'),
});

export const RunnerConfigSchema = z.object({
  baseSpeed: z.number().default(240),
  maxSpeed: z.number().default(500),
  accelerationRate: z.number().default(2),
  obstacleIntervalMs: z.number().default(1800),
  groundY: z.number().default(480),
  minObstacleGap: z.number().default(220),
  maxObstacleGap: z.number().default(400),
});

export const TopDownConfigSchema = z.object({
  arenaWidth: z.number().default(800),
  arenaHeight: z.number().default(600),
  walls: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })).default([]),
  exitX: z.number().default(720),
  exitY: z.number().default(100),
});

export const ReachabilityMetricsSchema = z.object({
  maxJumpHeight: z.number(),
  timeToApex: z.number(),
  totalAirTime: z.number(),
  maxJumpDistance: z.number(),
  isReachable: z.boolean(),
  warnings: z.array(z.string()).optional(),
});

export const GameSpecificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(100),
  genre: GameGenreSchema,
  prompt: z.string().min(3, 'Prompt is too short'),
  dimensions: GameDimensionsSchema,
  difficulty: DifficultyLevelSchema,
  theme: VisualThemeSchema.optional().default('cyberpunk'),
  mechanics: z.array(MechanicTypeSchema).min(1, 'Select at least one mechanic'),
  physics: GamePhysicsConfigSchema,
  player: z.object({
    startX: z.number().default(80),
    startY: z.number().default(360),
    width: z.number().default(24),
    height: z.number().default(32),
    color: z.string().default('#06b6d4'),
    maxLives: z.number().int().default(3),
    maxHealth: z.number().optional().default(100),
    invulnerabilityDurationMs: z.number().optional().default(1000),
  }).optional(),
  platforms: z.array(LevelPlatformSchema).optional(),
  collectibles: z.array(LevelCollectibleSchema).optional(),
  enemies: z.array(LevelEnemySchema).optional(),
  obstacles: z.array(LevelObstacleSchema).optional(),
  finishPoint: LevelFinishPointSchema.optional(),
  runnerConfig: RunnerConfigSchema.optional(),
  topDownConfig: TopDownConfigSchema.optional(),
  reachability: ReachabilityMetricsSchema.optional(),
  seed: z.string().optional(),
  targetFPS: z.number().int().min(30).max(144).default(60),
  backgroundColor: z.string().default('#0a0f1d'),
  createdFromPrompt: z.string(),
  version: z.string().default('0.1.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BugReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  projectVersion: z.string(),
  title: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['physics', 'collision', 'logic', 'level-reachability', 'game-loop', 'state', 'render']),
  defectLayer: z.enum(['specification', 'generated-artifact', 'shared-engine', 'infrastructure']).optional(),
  affectedMechanic: MechanicTypeSchema,
  expectedBehaviour: z.string(),
  actualBehaviour: z.string(),
  suspectedSourceLocation: z.object({
    file: z.string(),
    line: z.number().int(),
    symbol: z.string().optional(),
    snippet: z.string().optional(),
  }),
  evidence: z.object({
    testCaseId: z.string().optional(),
    failedAssertion: z.string().optional(),
    consoleLogs: z.array(z.string()).optional(),
    traceUrl: z.string().optional(),
    screenshotUrl: z.string().optional(),
  }),
  repairStatus: z.enum(['open', 'diagnosing', 'patch-in-progress', 'verified-fixed', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GenerationPromptRequestSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters'),
  genre: GameGenreSchema,
  mechanics: z.array(MechanicTypeSchema).min(1, 'Must select at least one mechanic'),
  difficulty: DifficultyLevelSchema,
  dimensions: GameDimensionsSchema.optional(),
  theme: VisualThemeSchema.optional(),
  additionalNotes: z.string().optional(),
});

export const UserRegistrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and Conditions to register',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const UserLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const UserAccountSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  termsAccepted: z.boolean(),
  termsAcceptedAt: z.string().optional(),
  termsVersion: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastActiveAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const BootstrapAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  displayName: z.string().min(1).max(50).optional(),
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;
export type BootstrapAdminInput = z.infer<typeof BootstrapAdminSchema>;

