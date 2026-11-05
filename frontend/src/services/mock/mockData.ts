import {
  GameProject,
  GameSpecification,
  TestCase,
  TestResult,
  BugReport,
  RepairIteration,
  AgentStatus,
} from '@shared/core';

export const INITIAL_SPECIFICATION: GameSpecification = {
  id: 'spec-neon-runner-01',
  title: 'Neon Vault Runner',
  genre: 'platformer',
  prompt: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
  dimensions: { width: 800, height: 600 },
  difficulty: 'medium',
  mechanics: [
    'player-movement',
    'jumping',
    'gravity',
    'platform-collision',
    'enemy-interaction',
    'collectibles',
    'score-system',
    'game-over-condition',
    'level-completion',
  ],
  physics: {
    gravityY: 750,
    gravityX: 0,
    bounce: 0.05,
    drag: 120,
    playerSpeed: 280,
    jumpVelocity: 520,
  },
  targetFPS: 60,
  backgroundColor: '#070a14',
  createdFromPrompt: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
  version: '0.3.0',
  createdAt: '2026-11-04T10:15:00.000Z',
  updatedAt: '2026-11-05T14:30:00.000Z',
};

export const MOCK_PROJECTS: GameProject[] = [
  {
    id: 'proj-01',
    name: 'Neon Vault Runner',
    description: 'Cyberpunk momentum platformer with wall sliding and gravity hazards.',
    status: 'testing',
    currentVersion: '0.3.0',
    genre: 'platformer',
    specification: INITIAL_SPECIFICATION,
    createdAt: '2026-11-04T10:15:00.000Z',
    updatedAt: '2026-11-05T14:30:00.000Z',
    totalRuns: 24,
    testsPassed: 7,
    testsFailed: 1,
    openBugsCount: 1,
  },
  {
    id: 'proj-02',
    name: 'Shadow Crypt Crawler',
    description: 'Top-down rogue-lite arena with directional dashing and torchlight vision mechanics.',
    status: 'verified',
    currentVersion: '1.0.0',
    genre: 'top-down',
    specification: {
      ...INITIAL_SPECIFICATION,
      id: 'spec-crawler-02',
      title: 'Shadow Crypt Crawler',
      genre: 'top-down',
      difficulty: 'hard',
      physics: {
        gravityY: 0,
        playerSpeed: 340,
        jumpVelocity: 0,
      },
      version: '1.0.0',
    },
    createdAt: '2026-11-01T08:20:00.000Z',
    updatedAt: '2026-11-03T19:45:00.000Z',
    totalRuns: 48,
    testsPassed: 8,
    testsFailed: 0,
    openBugsCount: 0,
  },
  {
    id: 'proj-03',
    name: 'Hyper Velocity Dash',
    description: 'Endless procedurally generating obstacle racer with ascending speed curves.',
    status: 'ready',
    currentVersion: '0.1.2',
    genre: 'endless-runner',
    specification: {
      ...INITIAL_SPECIFICATION,
      id: 'spec-runner-03',
      title: 'Hyper Velocity Dash',
      genre: 'endless-runner',
      difficulty: 'easy',
      version: '0.1.2',
    },
    createdAt: '2026-10-28T14:00:00.000Z',
    updatedAt: '2026-10-30T11:10:00.000Z',
    totalRuns: 16,
    testsPassed: 6,
    testsFailed: 2,
    openBugsCount: 2,
  },
];

export const MOCK_TEST_CASES: TestCase[] = [
  {
    id: 'test-move-01',
    name: 'Horizontal Movement Response',
    description: 'Validates that player entity velocity matches configured speed when horizontal inputs are dispatched.',
    mechanic: 'player-movement',
    status: 'passed',
    durationMs: 412,
    assertions: [
      { id: 'a1', description: 'Player moves right with speed 280 +/- 5px/s', expected: 'vx = 280', actual: 'vx = 280', passed: true },
      { id: 'a2', description: 'Player stops when keyup is triggered within 150ms', expected: 'vx = 0', actual: 'vx = 0', passed: true },
    ],
    timestamp: '2026-11-05T14:22:10.000Z',
  },
  {
    id: 'test-jump-02',
    name: 'Jump Velocity & Arc Trajectory',
    description: 'Ensures jump velocity reaches 520px/s upward and falls along gravity curve to ground.',
    mechanic: 'jumping',
    status: 'passed',
    durationMs: 640,
    assertions: [
      { id: 'a3', description: 'Initial jump velocity reaches -520px/s', expected: 'vy = -520', actual: 'vy = -520', passed: true },
      { id: 'a4', description: 'Apex reached between 400ms and 500ms', expected: 't_apex ~ 450ms', actual: 't_apex = 448ms', passed: true },
    ],
    timestamp: '2026-11-05T14:22:11.000Z',
  },
  {
    id: 'test-plat-03',
    name: 'Solid Platform Landing & Grounded Flag',
    description: 'Verifies player lands on solid tile bodies without tunneling and sets grounded=true.',
    mechanic: 'platform-collision',
    status: 'passed',
    durationMs: 380,
    assertions: [
      { id: 'a5', description: 'Y-position locks to platform top edge (y=480)', expected: 'y <= 480', actual: 'y = 480', passed: true },
      { id: 'a6', description: 'isGrounded transitions to true upon impact', expected: 'isGrounded = true', actual: 'isGrounded = true', passed: true },
    ],
    timestamp: '2026-11-05T14:22:12.000Z',
  },
  {
    id: 'test-grav-04',
    name: 'Gravity Acceleration Continuity',
    description: 'Checks acceleration vector remains constant during freefall.',
    mechanic: 'gravity',
    status: 'passed',
    durationMs: 510,
    assertions: [
      { id: 'a7', description: 'Downwards acceleration is 750px/s²', expected: 'ay = 750', actual: 'ay = 750', passed: true },
    ],
    timestamp: '2026-11-05T14:22:13.000Z',
  },
  {
    id: 'test-coin-05',
    name: 'Data-Shard Collectible Pickups',
    description: 'Checks item pickup overlap, sprite destroy event, and score increment.',
    mechanic: 'collectibles',
    status: 'passed',
    durationMs: 320,
    assertions: [
      { id: 'a8', description: 'Collectible destroyed upon player overlap', expected: 'item.active = false', actual: 'item.active = false', passed: true },
      { id: 'a9', description: 'Score increases by +100 per shard', expected: 'score = 100', actual: 'score = 100', passed: true },
    ],
    timestamp: '2026-11-05T14:22:14.000Z',
  },
  {
    id: 'test-enemy-06',
    name: 'Enemy Hazard Collision & Life Depletion',
    description: 'Validates that touching patrol drone reduces player health/lives.',
    mechanic: 'enemy-interaction',
    status: 'passed',
    durationMs: 440,
    assertions: [
      { id: 'a10', description: 'Lives decrements from 3 to 2 upon hazard contact', expected: 'lives = 2', actual: 'lives = 2', passed: true },
      { id: 'a11', description: 'Invulnerability frames active for 1000ms', expected: 'isInvulnerable = true', actual: 'isInvulnerable = true', passed: true },
    ],
    timestamp: '2026-11-05T14:22:15.000Z',
  },
  {
    id: 'test-gameover-07',
    name: 'Game-Over Condition & Pitfall Boundary',
    description: 'Checks that falling below viewport height (y > 650) triggers immediate game-over state.',
    mechanic: 'game-over-condition',
    status: 'passed',
    durationMs: 290,
    assertions: [
      { id: 'a12', description: 'Game state transitions to game_over=true', expected: 'gameState = GAME_OVER', actual: 'gameState = GAME_OVER', passed: true },
      { id: 'a13', description: 'Player input disabled after death', expected: 'inputEnabled = false', actual: 'inputEnabled = false', passed: true },
    ],
    timestamp: '2026-11-05T14:22:16.000Z',
  },
  {
    id: 'test-restart-08',
    name: 'Restart Scene & State Reset Reliability',
    description: 'Confirms restart action resets score, player coordinates, and re-spawns collected items.',
    mechanic: 'level-completion',
    status: 'failed',
    durationMs: 780,
    errorMessage: 'Assertion failed: Collectibles count after restart is 4, expected 5 (orphaned memory state in ShardManager).',
    assertions: [
      { id: 'a14', description: 'Player position reset to spawn (x=100, y=300)', expected: 'pos=(100,300)', actual: 'pos=(100,300)', passed: true },
      { id: 'a15', description: 'Score resets to 0', expected: 'score = 0', actual: 'score = 0', passed: true },
      { id: 'a16', description: 'All 5 data shards re-instantiated in scene', expected: 'activeShards = 5', actual: 'activeShards = 4', passed: false },
    ],
    timestamp: '2026-11-05T14:22:17.000Z',
  },
];

export const MOCK_TEST_RESULTS: TestResult = {
  runId: 'run-nov05-1422',
  projectId: 'proj-01',
  projectVersion: '0.3.0',
  startedAt: '2026-11-05T14:22:09.000Z',
  finishedAt: '2026-11-05T14:22:18.000Z',
  totalTests: 8,
  passedCount: 7,
  failedCount: 1,
  durationMs: 3472,
  tests: MOCK_TEST_CASES,
  overallStatus: 'failed',
};

export const MOCK_BUG_REPORTS: BugReport[] = [
  {
    id: 'bug-001',
    projectId: 'proj-01',
    projectVersion: '0.3.0',
    title: 'ShardManager retains stale destroyed flags upon scene restart',
    severity: 'high',
    category: 'state',
    affectedMechanic: 'level-completion',
    expectedBehaviour: 'When scene.restart() is called, all 5 collectible data-shards should be newly spawned and active in the physics world.',
    actualBehaviour: 'Only 4 shards spawn. Shard index #3 remains flagged as collected due to a cached Map in ShardManager that is not purged on scene teardown.',
    suspectedSourceLocation: {
      file: 'src/mechanics/ShardManager.ts',
      line: 42,
      symbol: 'ShardManager.prototype.resetCollection',
      snippet: 'this.collectedShards.clear(); // Misses secondary index map idCache',
    },
    evidence: {
      testCaseId: 'test-restart-08',
      failedAssertion: 'Assertion failed: activeShards expected 5, actual 4',
      consoleLogs: [
        '[WARN] ShardManager: Skipped instantiating shard-03 (marked as collected in idCache)',
        '[TEST_RUNNER] Failure registered at Step 3: restart assertions',
      ],
      traceUrl: '/traces/run-nov05-1422-restart.zip',
    },
    repairStatus: 'open',
    createdAt: '2026-11-05T14:25:00.000Z',
    updatedAt: '2026-11-05T14:25:00.000Z',
  },
  {
    id: 'bug-002',
    projectId: 'proj-03',
    projectVersion: '0.1.2',
    title: 'Ceiling collision clips player through upper world boundary at high jump velocities',
    severity: 'critical',
    category: 'collision',
    affectedMechanic: 'jumping',
    expectedBehaviour: 'Touching top ceiling collider should zero-out vertical velocity and cause player to begin falling immediately.',
    actualBehaviour: 'At velocities > 600px/s, discrete physics step penetrates ceiling boundary by 14px, locking player in infinite vibration.',
    suspectedSourceLocation: {
      file: 'src/physics/CollisionMatrix.ts',
      line: 88,
      symbol: 'handleCeilingContact',
      snippet: 'body.blocked.up ? (body.velocity.y = 0) : null;',
    },
    evidence: {
      testCaseId: 'test-jump-02',
      failedAssertion: 'Player Y position exceeded min clamp boundary: y = -14',
      consoleLogs: ['[ERROR] PhysicsEngine: Tunneling detected on body ID #player-0'],
    },
    repairStatus: 'patch-in-progress',
    createdAt: '2026-11-04T18:10:00.000Z',
    updatedAt: '2026-11-05T09:15:00.000Z',
  },
  {
    id: 'bug-003',
    projectId: 'proj-01',
    projectVersion: '0.2.0',
    title: 'Camera lerp jitter when player reverses direction rapidly',
    severity: 'low',
    category: 'render',
    affectedMechanic: 'player-movement',
    expectedBehaviour: 'Camera deadzone should dampen fast horizontal turns with smooth exponential decay.',
    actualBehaviour: 'Linear interpolation caused a 2px horizontal camera snap on frame 1 of opposite direction input.',
    suspectedSourceLocation: {
      file: 'src/scenes/MainScene.ts',
      line: 114,
      symbol: 'updateCameraFollow',
      snippet: 'this.cameras.main.scrollX = Math.round(player.x - 400);',
    },
    evidence: {
      failedAssertion: 'Camera delta exceeded smoothing threshold of 1.2px/frame',
    },
    repairStatus: 'verified-fixed',
    createdAt: '2026-11-03T11:00:00.000Z',
    updatedAt: '2026-11-04T16:00:00.000Z',
  },
];

export const MOCK_REPAIR_ITERATIONS: RepairIteration[] = [
  {
    id: 'rep-01',
    bugReportId: 'bug-003',
    projectId: 'proj-01',
    iterationNumber: 1,
    description: 'Replace direct camera rounding with damped follow lerp coefficient (0.08).',
    diffPatch: `--- a/src/scenes/MainScene.ts
+++ b/src/scenes/MainScene.ts
@@ -114,2 +114,3 @@
-    this.cameras.main.scrollX = Math.round(player.x - 400);
+    const targetX = player.x - 400;
+    this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * 0.08;`,
    affectedFiles: ['src/scenes/MainScene.ts'],
    isSuccessful: true,
    createdAt: '2026-11-04T15:45:00.000Z',
  },
  {
    id: 'rep-02',
    bugReportId: 'bug-002',
    projectId: 'proj-03',
    iterationNumber: 1,
    description: 'Implement continuous collision detection raycast ahead of high-velocity jump steps.',
    diffPatch: `--- a/src/physics/CollisionMatrix.ts
+++ b/src/physics/CollisionMatrix.ts
@@ -88,1 +88,4 @@
-    body.blocked.up ? (body.velocity.y = 0) : null;
+    if (body.velocity.y < -500) {
+      this.sweepRaycastUpward(body, delta);
+    }`,
    affectedFiles: ['src/physics/CollisionMatrix.ts'],
    isSuccessful: false,
    createdAt: '2026-11-05T09:00:00.000Z',
  },
];

export const MOCK_AGENT_STATUSES: AgentStatus[] = [
  {
    role: 'generator',
    state: 'idle',
    lastMessage: 'Generated Neon Vault Runner v0.3.0 with 9 verified mechanics.',
    timestamp: '2026-11-05T14:20:00.000Z',
  },
  {
    role: 'test-planner',
    state: 'idle',
    lastMessage: 'Synthesized 8 Playwright test scenarios covering full state matrix.',
    timestamp: '2026-11-05T14:21:00.000Z',
  },
  {
    role: 'playtester',
    state: 'idle',
    lastMessage: 'Completed run-nov05-1422 (7 passed, 1 failed in 3.47s).',
    timestamp: '2026-11-05T14:22:18.000Z',
  },
  {
    role: 'diagnostician',
    state: 'analyzing',
    currentTask: 'Pinpointing stale cache mutation in ShardManager.ts',
    progressPercentage: 74,
    lastMessage: 'Identified unpurged secondary index idCache at line 42.',
    timestamp: '2026-11-05T14:26:00.000Z',
  },
  {
    role: 'repair',
    state: 'idle',
    lastMessage: 'Awaiting diagnosis confirmation to generate AST surgical patch.',
    timestamp: '2026-11-05T14:26:30.000Z',
  },
];

export const MOCK_HISTORY_VERSIONS = [
  {
    version: '0.3.0',
    date: '2026-11-05 14:30',
    prompt: 'Added glowing gravity-inversion hazards and data-shard collectibles with score multiplier.',
    tests: { passed: 7, failed: 1 },
    status: 'testing',
    changes: [
      'Added ShardManager collectible mechanics',
      'Configured variable jump velocity curves',
      'Integrated Playwright assertion harness',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-11-04 16:00',
    prompt: 'Implement solid platform collision and camera tracking with deadzone damping.',
    tests: { passed: 6, failed: 0 },
    status: 'verified',
    changes: [
      'Fixed camera jitter with smoothed exponential decay',
      'Introduced tilemap collision layer',
      'Added lives depletion on hazard overlap',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-11-04 10:15',
    prompt: 'Initial generation: 2D platformer base scene with player entity and arrow-key movement.',
    tests: { passed: 3, failed: 1 },
    status: 'verified',
    changes: [
      'Initial Phaser 3 runtime adapter instantiation',
      'Basic horizontal movement and jump physics',
    ],
  },
];

