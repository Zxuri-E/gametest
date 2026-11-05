import {
  GameProject,
  GameSpecification,
  TestCase,
  TestResult,
  BugReport,
  RepairIteration,
  AgentStatus,
} from '@shared/core';
import {
  MOCK_PROJECTS,
  INITIAL_SPECIFICATION,
  MOCK_TEST_CASES,
  MOCK_TEST_RESULTS,
  MOCK_BUG_REPORTS,
  MOCK_REPAIR_ITERATIONS,
  MOCK_AGENT_STATUSES,
  MOCK_HISTORY_VERSIONS,
} from './mockData';

// Simulated network latency utility
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GenerateGamePayload {
  prompt: string;
  genre: 'platformer' | 'top-down' | 'endless-runner';
  mechanics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  dimensions: { width: number; height: number };
  physics: {
    gravityY: number;
    playerSpeed: number;
    jumpVelocity: number;
  };
}

export class MockApiService {
  private projects: GameProject[] = [...MOCK_PROJECTS];
  private currentSpec: GameSpecification = { ...INITIAL_SPECIFICATION };
  private testCases: TestCase[] = [...MOCK_TEST_CASES];
  private testResults: TestResult = { ...MOCK_TEST_RESULTS };
  private bugReports: BugReport[] = [...MOCK_BUG_REPORTS];
  private repairIterations: RepairIteration[] = [...MOCK_REPAIR_ITERATIONS];
  private agentStatuses: AgentStatus[] = [...MOCK_AGENT_STATUSES];

  /**
   * Retrieve list of all game projects
   */
  async getProjects(): Promise<GameProject[]> {
    await delay(250);
    return [...this.projects];
  }

  /**
   * Retrieve a single project by ID
   */
  async getProjectById(id: string): Promise<GameProject | null> {
    await delay(180);
    const found = this.projects.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  /**
   * Retrieve current active game specification
   */
  async getActiveSpecification(): Promise<GameSpecification> {
    await delay(150);
    return { ...this.currentSpec };
  }

  /**
   * Update game specification (e.g. tweaking physics or mechanics)
   */
  async updateSpecification(spec: Partial<GameSpecification>): Promise<GameSpecification> {
    await delay(200);
    this.currentSpec = {
      ...this.currentSpec,
      ...spec,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.currentSpec };
  }

  /**
   * Simulated AI Game Generation Pipeline with progressive status callbacks
   */
  async generateGame(
    payload: GenerateGamePayload,
    onStep?: (step: string, progress: number) => void
  ): Promise<GameSpecification> {
    onStep?.('Analyzing prompt and intent extraction...', 15);
    await delay(500);

    onStep?.('Synthesizing GameSpecification domain schema...', 35);
    await delay(600);

    onStep?.('Generating 2D scene hierarchy and mechanics classes...', 65);
    await delay(700);

    onStep?.('Synthesizing Playwright test plan & assertion criteria...', 85);
    await delay(500);

    onStep?.('Compiling Phaser 3 runtime bundle...', 95);
    await delay(400);

    const newVersion = `0.${this.projects.length + 1}.0`;
    const newSpec: GameSpecification = {
      id: `spec-${Date.now()}`,
      title: payload.prompt.split(' ').slice(0, 4).join(' ') || 'Generated Game',
      genre: payload.genre,
      prompt: payload.prompt,
      dimensions: payload.dimensions,
      difficulty: payload.difficulty,
      mechanics: payload.mechanics as any,
      physics: {
        gravityY: payload.physics.gravityY,
        playerSpeed: payload.physics.playerSpeed,
        jumpVelocity: payload.physics.jumpVelocity,
        bounce: 0.1,
        drag: 100,
      },
      targetFPS: 60,
      backgroundColor: payload.genre === 'platformer' ? '#090d18' : '#0e1726',
      createdFromPrompt: payload.prompt,
      version: newVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.currentSpec = newSpec;

    // Add to project list
    const newProject: GameProject = {
      id: `proj-${Date.now()}`,
      name: newSpec.title,
      description: payload.prompt,
      status: 'ready',
      currentVersion: newVersion,
      genre: payload.genre,
      specification: newSpec,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRuns: 0,
      testsPassed: 0,
      testsFailed: 0,
      openBugsCount: 0,
    };
    this.projects.unshift(newProject);

    onStep?.('Generation completed successfully!', 100);
    return { ...newSpec };
  }

  /**
   * Retrieve test cases for active project
   */
  async getTestCases(): Promise<TestCase[]> {
    await delay(180);
    return [...this.testCases];
  }

  /**
   * Run automated verification test suite
   */
  async executeTestSuite(
    onTestStep?: (testId: string, status: 'running' | 'passed' | 'failed') => void
  ): Promise<TestResult> {
    const updatedTests: TestCase[] = [];

    for (const test of this.testCases) {
      onTestStep?.(test.id, 'running');
      await delay(250);

      const isFailed = test.id === 'test-restart-08';
      const status = isFailed ? 'failed' : 'passed';
      onTestStep?.(test.id, status);

      updatedTests.push({
        ...test,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    this.testCases = updatedTests;
    const passedCount = updatedTests.filter((t) => t.status === 'passed').length;
    const failedCount = updatedTests.filter((t) => t.status === 'failed').length;

    this.testResults = {
      runId: `run-${Date.now()}`,
      projectId: this.currentSpec.id,
      projectVersion: this.currentSpec.version,
      startedAt: new Date(Date.now() - 3200).toISOString(),
      finishedAt: new Date().toISOString(),
      totalTests: updatedTests.length,
      passedCount,
      failedCount,
      durationMs: 3200,
      tests: updatedTests,
      overallStatus: failedCount > 0 ? 'failed' : 'passed',
    };

    return { ...this.testResults };
  }

  /**
   * Retrieve bug reports
   */
  async getBugReports(): Promise<BugReport[]> {
    await delay(200);
    return [...this.bugReports];
  }

  /**
   * Update bug report repair status
   */
  async updateBugStatus(bugId: string, status: BugReport['repairStatus']): Promise<BugReport | null> {
    await delay(250);
    const bug = this.bugReports.find((b) => b.id === bugId);
    if (!bug) return null;
    bug.repairStatus = status;
    bug.updatedAt = new Date().toISOString();
    return { ...bug };
  }

  /**
   * Simulated Auto-Repair Agent action
   */
  async triggerAutoRepair(bugId: string): Promise<{ success: boolean; iteration: RepairIteration; updatedBug: BugReport }> {
    await delay(1200); // Simulate agent analysis & diff generation
    const bug = this.bugReports.find((b) => b.id === bugId);
    if (!bug) throw new Error('Bug not found');

    const iteration: RepairIteration = {
      id: `rep-${Date.now()}`,
      bugReportId: bugId,
      projectId: bug.projectId,
      iterationNumber: this.repairIterations.length + 1,
      description: `Surgical AST patch applied to ${bug.suspectedSourceLocation.file} to resolve ${bug.title}`,
      diffPatch: `--- a/${bug.suspectedSourceLocation.file}
+++ b/${bug.suspectedSourceLocation.file}
@@ -${bug.suspectedSourceLocation.line},3 +${bug.suspectedSourceLocation.line},5 @@
-  ${bug.suspectedSourceLocation.snippet || '// original code'}
+  // Verified patch generated by Repair Agent
+  this.resetAllStateCaches();
+  this.purgeOrphanedEntities();`,
      affectedFiles: [bug.suspectedSourceLocation.file],
      isSuccessful: true,
      createdAt: new Date().toISOString(),
    };

    this.repairIterations.unshift(iteration);
    bug.repairStatus = 'verified-fixed';
    bug.updatedAt = new Date().toISOString();

    return {
      success: true,
      iteration,
      updatedBug: { ...bug },
    };
  }

  /**
   * Retrieve repair iterations history
   */
  async getRepairIterations(): Promise<RepairIteration[]> {
    await delay(180);
    return [...this.repairIterations];
  }

  /**
   * Retrieve live agent status telemetry
   */
  async getAgentStatuses(): Promise<AgentStatus[]> {
    await delay(100);
    return [...this.agentStatuses];
  }

  /**
   * Retrieve project version history
   */
  async getProjectHistory() {
    await delay(200);
    return [...MOCK_HISTORY_VERSIONS];
  }
}

export const mockApi = new MockApiService();

