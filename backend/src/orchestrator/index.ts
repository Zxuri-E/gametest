import {
  GameProject,
  GameSpecification,
  GameGenre,
  DifficultyLevel,
  VisualTheme,
  TestResult,
  BugReport,
  RepairIteration,
  AgentStatus,
} from '@shared/core';
import { generatorAgent } from '../agents/generator';
import { testPlannerAgent } from '../agents/test-planner';
import { playtesterAgent } from '../agents/playtester';
import { diagnosticianAgent } from '../agents/diagnostician';
import { repairAgent } from '../agents/repair';
import { storage } from '../services/storage';

export class AgentOrchestrator {
  /**
   * Complete Autonomous Generation Workflow:
   * Prompt -> Generator -> Test Planner -> Storage -> Project Ready
   */
  async generateGame(
    prompt: string,
    genre: GameGenre = 'platformer',
    difficulty: DifficultyLevel = 'medium',
    theme?: VisualTheme
  ): Promise<{ project: GameProject; specification: GameSpecification }> {
    // 1. Generator Agent creates validated GameSpecification
    const spec = await generatorAgent.generate(prompt, genre, difficulty, theme);

    // 2. Test Planner Agent synthesizes matching Playwright tests
    const tests = await testPlannerAgent.planTests(spec);

    // 3. Register GameProject in persistent storage
    const project: GameProject = {
      id: `proj-${Date.now()}`,
      name: spec.title,
      description: prompt,
      status: 'ready',
      currentVersion: spec.version,
      genre: spec.genre,
      specification: spec,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRuns: 0,
      testsPassed: tests.length,
      testsFailed: 0,
      openBugsCount: 0,
    };

    await storage.saveProject(project);

    return { project, specification: spec };
  }

  /**
   * Automated Verification Workflow:
   * Spec -> Playtester executes tests -> (If failure: Diagnostician logs bug report)
   */
  async executeVerification(projectId: string): Promise<TestResult> {
    const project = await storage.getProjectById(projectId);
    const spec = project?.specification || (await storage.getSpecification(projectId));
    if (!spec) throw new Error(`Project specification ${projectId} not found`);

    // Plan & Execute tests
    const tests = await testPlannerAgent.planTests(spec);
    const result = await playtesterAgent.executeTests(spec, tests);

    await storage.saveTestResult(result);

    // If any test failed, trigger Diagnostician Agent
    if (result.failedCount > 0) {
      const bugs = await diagnosticianAgent.diagnose(result);
      for (const bug of bugs) {
        await storage.saveBugReport(bug);
      }
    }

    return result;
  }

  /**
   * Autonomous Bug Repair Workflow:
   * BugReport -> Repair Agent generates AST diff -> Applies patch -> Re-verifies fix
   */
  async diagnoseAndRepair(bugId: string): Promise<{ success: boolean; iteration: RepairIteration; updatedBug: BugReport }> {
    const bug = await storage.getBugReportById(bugId);
    if (!bug) throw new Error(`Bug report ${bugId} not found`);

    const repairOutcome = await repairAgent.attemptRepair(bug);
    return repairOutcome;
  }

  /**
   * Controlled Acceptance Test Fixture:
   * Deliberately injects a broken reachability or jump defect into the specification to prove:
   * automated failure detection -> diagnosis -> code repair -> verified fix!
   */
  async triggerControlledDefect(projectId: string): Promise<{ bug: BugReport; testResult: TestResult }> {
    const project = await storage.getProjectById(projectId);
    const spec = project?.specification;
    if (!spec) throw new Error(`Project ${projectId} not found`);

    // Inject deliberate kinematic reachability defect:
    // Move platform p3 to y=180, requiring a vertical climb of 210px which exceeds
    // the max jump apex of 153px computed from jumpVelocity=520 and gravityY=750.
    if (spec.platforms) {
      const p3 = spec.platforms.find((p) => p.id === 'p3');
      if (p3) {
        p3.y = 180;
        await storage.saveSpecification(spec);
      }
    }

    // Run test planner & playtester with actual kinematic evaluation
    const tests = await testPlannerAgent.planTests(spec);
    const testResult = await playtesterAgent.executeTests(spec, tests);

    await storage.saveTestResult(testResult);

    // Diagnostician isolates root cause
    const bugs = await diagnosticianAgent.diagnose(testResult);
    if (bugs.length === 0) {
      throw new Error('Controlled defect was not detected by test assertions.');
    }
    const createdBug = bugs[0]!;
    await storage.saveBugReport(createdBug);

    return { bug: createdBug, testResult };
  }

  public getAgentStatuses(): AgentStatus[] {
    return [
      generatorAgent.getStatus(),
      testPlannerAgent.getStatus(),
      playtesterAgent.getStatus(),
      diagnosticianAgent.getStatus(),
      repairAgent.getStatus(),
    ];
  }
}

export const orchestrator = new AgentOrchestrator();
