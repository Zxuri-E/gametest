import fs from 'fs';
import path from 'path';
import {
  GameProject,
  GameSpecification,
  TestResult,
  BugReport,
  RepairIteration,
} from '@shared/core';

export interface NovusDatabase {
  projects: GameProject[];
  specifications: Record<string, GameSpecification>;
  testResults: TestResult[];
  bugReports: BugReport[];
  repairIterations: RepairIteration[];
  settings: Record<string, any>;
}

export class StorageService {
  private dbPath: string;
  private data: NovusDatabase;
  constructor(customPath?: string) {
    const rootDir = process.cwd().endsWith('backend') ? path.resolve(process.cwd(), '..') : process.cwd();
    const dataDir = path.resolve(rootDir, 'backend/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = customPath || path.join(dataDir, 'novus_db.json');
    this.data = this.loadDatabase();
  }

  private loadDatabase(): NovusDatabase {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Storage] Failed to read existing db, initializing defaults:', err);
    }
    return this.createInitialData();
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error persisting to disk:', err);
    }
  }

  private createInitialData(): NovusDatabase {
    const initialSpec: GameSpecification = {
      id: 'spec-neon-runner-01',
      title: 'Neon Vault Runner',
      genre: 'platformer',
      prompt: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
      dimensions: { width: 800, height: 600 },
      difficulty: 'medium',
      theme: 'cyberpunk',
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
      platforms: [
        { id: 'ground', x: 0, y: 560, width: 1600, height: 40, type: 'solid' },
        { id: 'p1', x: 160, y: 470, width: 140, height: 20, type: 'solid' },
        { id: 'p2', x: 380, y: 390, width: 150, height: 20, type: 'solid' },
        { id: 'p3', x: 610, y: 320, width: 140, height: 20, type: 'moving', minX: 580, maxX: 720 },
        { id: 'p4', x: 840, y: 400, width: 160, height: 20, type: 'solid' },
        { id: 'p-goal', x: 1100, y: 480, width: 120, height: 20, type: 'solid' },
      ],
      collectibles: [
        { id: 'c1', x: 230, y: 430, type: 'gem', points: 100 },
        { id: 'c2', x: 450, y: 350, type: 'gem', points: 100 },
        { id: 'c3', x: 670, y: 280, type: 'gem', points: 100 },
        { id: 'c4', x: 920, y: 360, type: 'gem', points: 100 },
      ],
      enemies: [
        {
          id: 'drone-1',
          x: 450,
          y: 360,
          width: 24,
          height: 24,
          type: 'patrol',
          speed: 60,
          minX: 390,
          maxX: 520,
          damage: 1,
        },
      ],
      finishPoint: { x: 1160, y: 440, width: 36, height: 48, type: 'portal' },
      targetFPS: 60,
      backgroundColor: '#070a14',
      createdFromPrompt: 'A cyberpunk 2D platformer with variable jump height, wall slides, glowing gravity-inversion hazards, and data-shard collectibles.',
      version: '0.3.0',
      createdAt: '2026-11-04T10:15:00.000Z',
      updatedAt: '2026-11-05T14:30:00.000Z',
    };

    const initialProject: GameProject = {
      id: 'proj-01',
      name: 'Neon Vault Runner',
      description: 'Cyberpunk momentum platformer with wall sliding and gravity hazards.',
      status: 'testing',
      currentVersion: '0.3.0',
      genre: 'platformer',
      specification: initialSpec,
      createdAt: '2026-11-04T10:15:00.000Z',
      updatedAt: '2026-11-05T14:30:00.000Z',
      totalRuns: 24,
      testsPassed: 7,
      testsFailed: 1,
      openBugsCount: 1,
    };

    const initialBugs: BugReport[] = [
      {
        id: 'bug-001',
        projectId: 'proj-01',
        projectVersion: '0.3.0',
        title: 'Platform reachability vertical climb exceeds safe jump height',
        severity: 'high',
        category: 'level-reachability',
        affectedMechanic: 'jumping',
        expectedBehaviour: 'Vertical separation between Platform #2 and #3 should be ≤ 140px based on jump velocity 520px/s.',
        actualBehaviour: 'Platform #3 spawned at y=260px (climb of 170px), exceeding maximum theoretical jump apex of 152px.',
        suspectedSourceLocation: {
          file: 'game-engine/src/scenes/PlatformerScene.ts',
          line: 42,
          symbol: 'PlatformerScene.prototype.createPlatform',
          snippet: 'plat.y = 260; // Exceeds physics reachability limit',
        },
        evidence: {
          testCaseId: 'test-jump-02',
          failedAssertion: 'Player failed to reach platform landing surface: max Y apex 328, platform top Y 260',
          consoleLogs: ['[REACHABILITY_CHECK] Vertical climb 170px > allowed 140px'],
        },
        repairStatus: 'open',
        createdAt: '2026-11-05T14:25:00.000Z',
        updatedAt: '2026-11-05T14:25:00.000Z',
      },
    ];

    const initialRepair: RepairIteration[] = [
      {
        id: 'rep-01',
        bugReportId: 'bug-001',
        projectId: 'proj-01',
        iterationNumber: 1,
        description: 'Lower platform #3 Y coordinate from 260 to 320 to satisfy reachability criteria.',
        diffPatch: `--- a/game-engine/src/scenes/PlatformerScene.ts
+++ b/game-engine/src/scenes/PlatformerScene.ts
@@ -42,1 +42,1 @@
-  { id: 'p3', x: 610, y: 260, width: 140, height: 20 },
+  { id: 'p3', x: 610, y: 320, width: 140, height: 20 },`,
        affectedFiles: ['game-engine/src/scenes/PlatformerScene.ts'],
        isSuccessful: true,
        createdAt: '2026-11-05T14:30:00.000Z',
      },
    ];

    const db: NovusDatabase = {
      projects: [initialProject],
      specifications: { [initialSpec.id]: initialSpec },
      testResults: [],
      bugReports: initialBugs,
      repairIterations: initialRepair,
      settings: {
        aiProvider: 'anthropic',
        generatorModel: 'claude-3-5-sonnet-20241022',
        testerModel: 'claude-3-5-haiku-20241022',
        diagnosticianModel: 'claude-3-5-sonnet-20241022',
        repairModel: 'claude-3-5-sonnet-20241022',
      },
    };

    return db;
  }

  public getPersistenceMode(): { type: 'firestore' | 'local-json'; target: string; active: boolean } {
    if (process.env.FIREBASE_PROJECT_ID && (process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      return {
        type: 'firestore',
        target: `Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`,
        active: true,
      };
    }
    return {
      type: 'local-json',
      target: this.dbPath,
      active: true,
    };
  }

  // --- Projects ---
  public async getProjects(): Promise<GameProject[]> {
    return [...this.data.projects];
  }

  public async getProjectById(id: string): Promise<GameProject | null> {
    const found = this.data.projects.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  public async saveProject(project: GameProject): Promise<void> {
    const idx = this.data.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      this.data.projects[idx] = { ...project };
    } else {
      this.data.projects.unshift({ ...project });
    }
    this.data.specifications[project.specification.id] = { ...project.specification };
    this.saveDatabase();
  }

  // --- Specifications ---
  public async getSpecification(id: string): Promise<GameSpecification | null> {
    return this.data.specifications[id] ? { ...this.data.specifications[id]! } : null;
  }

  public async saveSpecification(spec: GameSpecification): Promise<void> {
    this.data.specifications[spec.id] = { ...spec };
    // Also update attached project
    const proj = this.data.projects.find((p) => p.specification.id === spec.id);
    if (proj) {
      proj.specification = { ...spec };
      proj.updatedAt = new Date().toISOString();
    }
    this.saveDatabase();
  }

  // --- Test Results ---
  public async getTestResults(projectId?: string): Promise<TestResult[]> {
    if (!projectId) return [...this.data.testResults];
    return this.data.testResults.filter((r) => r.projectId === projectId);
  }

  public async saveTestResult(result: TestResult): Promise<void> {
    this.data.testResults.unshift({ ...result });
    // Update project pass/fail stats
    const proj = this.data.projects.find((p) => p.id === result.projectId || p.specification.id === result.projectId);
    if (proj) {
      proj.totalRuns += 1;
      proj.testsPassed = result.passedCount;
      proj.testsFailed = result.failedCount;
      proj.status = result.failedCount > 0 ? 'testing' : 'verified';
      proj.updatedAt = new Date().toISOString();
    }
    this.saveDatabase();
  }

  // --- Bug Reports ---
  public async getBugReports(projectId?: string): Promise<BugReport[]> {
    if (!projectId) return [...this.data.bugReports];
    return this.data.bugReports.filter((b) => b.projectId === projectId);
  }

  public async getBugReportById(id: string): Promise<BugReport | null> {
    const bug = this.data.bugReports.find((b) => b.id === id);
    return bug ? { ...bug } : null;
  }

  public async saveBugReport(bug: BugReport): Promise<void> {
    const idx = this.data.bugReports.findIndex((b) => b.id === bug.id);
    if (idx >= 0) {
      this.data.bugReports[idx] = { ...bug };
    } else {
      this.data.bugReports.unshift({ ...bug });
    }
    // Update open bugs count
    const proj = this.data.projects.find((p) => p.id === bug.projectId);
    if (proj) {
      proj.openBugsCount = this.data.bugReports.filter(
        (b) => b.projectId === proj.id && b.repairStatus !== 'verified-fixed'
      ).length;
    }
    this.saveDatabase();
  }

  // --- Repair Iterations ---
  public async getRepairIterations(bugReportId?: string): Promise<RepairIteration[]> {
    if (!bugReportId) return [...this.data.repairIterations];
    return this.data.repairIterations.filter((r) => r.bugReportId === bugReportId);
  }

  public async saveRepairIteration(iteration: RepairIteration): Promise<void> {
    this.data.repairIterations.unshift({ ...iteration });
    this.saveDatabase();
  }

  // --- Settings ---
  public async getSettings(): Promise<Record<string, any>> {
    return { ...this.data.settings };
  }

  public async saveSettings(settings: Record<string, any>): Promise<void> {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveDatabase();
  }
}

export const storage = new StorageService();
