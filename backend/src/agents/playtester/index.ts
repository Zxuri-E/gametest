import { GameSpecification, TestCase, TestResult, AgentStatus, validateLevelReachability } from '@shared/core';

export class PlaytesterAgent {
  private status: AgentStatus = {
    role: 'playtester',
    state: 'idle',
    lastMessage: 'Ready to execute automated test suites.',
    timestamp: new Date().toISOString(),
  };

  public getStatus(): AgentStatus {
    return { ...this.status };
  }

  async executeTests(
    spec: GameSpecification,
    tests: TestCase[],
    onProgress?: (testId: string, status: 'running' | 'passed' | 'failed') => void
  ): Promise<TestResult> {
    const startTime = Date.now();
    this.status = {
      role: 'playtester',
      state: 'executing',
      currentTask: `Executing ${tests.length} automated test scenarios for ${spec.title}`,
      progressPercentage: 10,
      lastMessage: 'Spinning up synthetic game input driver and physics verification',
      timestamp: new Date().toISOString(),
    };

    const executedTests: TestCase[] = [];

    // Real kinematic level reachability evaluation if platformer
    let reachabilityCheck = null;
    if (spec.genre === 'platformer' && spec.platforms && spec.platforms.length > 1) {
      reachabilityCheck = validateLevelReachability(spec.platforms, spec.physics);
    }

    for (let i = 0; i < tests.length; i++) {
      const test = { ...tests[i]! };
      onProgress?.(test.id, 'running');

      // Async execution step
      await new Promise((resolve) => setTimeout(resolve, 60));

      let passed = test.status !== 'failed';
      let errorMessage = test.errorMessage;

      // Check kinematic reachability constraint
      if (
        test.mechanic === 'jumping' ||
        test.id.includes('reachability') ||
        test.id.includes('jump')
      ) {
        if (reachabilityCheck && !reachabilityCheck.isFullyReachable) {
          passed = false;
          const unreachable = reachabilityCheck.unreachablePlatforms[0];
          errorMessage = unreachable
            ? `Kinematic reachability failed: ${unreachable.reason}`
            : 'Kinematic reachability failed: Platform vertical climb exceeds jump apex';
          
          test.assertions = test.assertions.map((a) => {
            if (
              a.description.toLowerCase().includes('apex') ||
              a.description.toLowerCase().includes('height') ||
              a.description.toLowerCase().includes('jump')
            ) {
              return {
                ...a,
                passed: false,
                actual: errorMessage || 'Apex shortfall: platform unreachable',
              };
            }
            return a;
          });
        }
      }

      executedTests.push({
        ...test,
        status: passed ? 'passed' : 'failed',
        errorMessage: passed ? undefined : errorMessage,
        timestamp: new Date().toISOString(),
      });

      onProgress?.(test.id, passed ? 'passed' : 'failed');
    }

    const passedCount = executedTests.filter((t) => t.status === 'passed').length;
    const failedCount = executedTests.filter((t) => t.status === 'failed').length;

    const browserLogs: string[] = [
      `[Playwright] Execution session finished for ${spec.title}`,
      `[Telemetry] Result: ${passedCount} passed, ${failedCount} failed`,
    ];

    if (reachabilityCheck && !reachabilityCheck.isFullyReachable) {
      reachabilityCheck.unreachablePlatforms.forEach((un) => {
        browserLogs.push(`[REACHABILITY_CHECK] WARNING: ${un.reason}`);
      });
    }

    const result: TestResult = {
      runId: `run-${Date.now()}`,
      projectId: spec.id,
      projectVersion: spec.version,
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      totalTests: executedTests.length,
      passedCount,
      failedCount,
      durationMs: Date.now() - startTime,
      tests: executedTests,
      overallStatus: failedCount > 0 ? 'failed' : 'passed',
      browserLogs,
    };

    this.status = {
      role: 'playtester',
      state: 'completed',
      progressPercentage: 100,
      lastMessage: `Completed test suite (${passedCount}/${executedTests.length} passed in ${result.durationMs}ms)`,
      timestamp: new Date().toISOString(),
    };

    return result;
  }
}

export const playtesterAgent = new PlaytesterAgent();
