import { z } from 'zod';

export const GameGenreSchema = z.enum(['platformer', 'top-down', 'endless-runner']);

export const DifficultyLevelSchema = z.enum(['easy', 'medium', 'hard']);

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
  jumpVelocity: z.number().min(100).max(1200).default(550),
});

export const GameSpecificationSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(1, 'Title is required').max(100),
  genre: GameGenreSchema,
  prompt: z.string().min(3, 'Prompt is too short'),
  dimensions: GameDimensionsSchema,
  difficulty: DifficultyLevelSchema,
  mechanics: z.array(MechanicTypeSchema).min(1, 'Select at least one mechanic'),
  physics: GamePhysicsConfigSchema,
  targetFPS: z.number().int().min(30).max(144).default(60),
  backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#0a0f1d'),
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
  category: z.enum(['physics', 'collision', 'logic', 'game-loop', 'state', 'render']),
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
  }),
  repairStatus: z.enum(['open', 'diagnosing', 'patch-in-progress', 'verified-fixed', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GenerationPromptRequestSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  genre: GameGenreSchema,
  mechanics: z.array(MechanicTypeSchema).min(1, 'Must select at least one mechanic'),
  difficulty: DifficultyLevelSchema,
  dimensions: GameDimensionsSchema.optional(),
  additionalNotes: z.string().optional(),
});

