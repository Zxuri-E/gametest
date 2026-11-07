import { TestResult, BugReport, AgentStatus } from '@shared/core';
import { llmService } from '../../services/llm';

export class DiagnosticianAgent {
  private status: AgentStatus = {
    role: 'diagnostician',
    state: 'idle',
    lastMessage: 'Ready to diagnose test failure anomalies.',
    timestamp: new Date().toISOString(),
  };

  public getStatus(): AgentStatus {
    return { ...this.status };
  }

  async diagnose(result: TestResult, sourceSnippet?: string): Promise<BugReport[]> {
    const failedTests = result.tests.filter((t) => t.status === 'failed');
    if (failedTests.length === 0) return [];

    this.status = {
      role: 'diagnostician',
      state: 'analyzing',
      currentTask: `Pinpointing root causes for ${failedTests.length} failed assertion(s)`,
      progressPercentage: 45,
      lastMessage: 'Cross-referencing failure telemetry with scene kinematics logic',
      timestamp: new Date().toISOString(),
    };

    const reports: BugReport[] = [];

    for (const test of failedTests) {
      const failedAssertion = test.assertions.find((a) => !a.passed);
      const diagResponse = await llmService.diagnoseDefect(
        test.errorMessage || failedAssertion?.description || 'Assertion failed',
        failedAssertion?.expected || 'Nominal behavior',
        failedAssertion?.actual || 'Observed failure',
        sourceSnippet || '// game code'
      );

      const bug: BugReport = {
        id: `bug-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: result.projectId,
        projectVersion: result.projectVersion,
        title: `${test.name}: ${failedAssertion?.description || 'Assertion failure'}`,
        severity: test.mechanic === 'jumping' || test.mechanic === 'platform-collision' ? 'high' : 'medium',
        category: diagResponse.data.category as any,
        affectedMechanic: test.mechanic,
        expectedBehaviour: failedAssertion?.expected || 'System should operate within nominal parameters',
        actualBehaviour: failedAssertion?.actual || test.errorMessage || 'Failure encountered',
        suspectedSourceLocation: {
          file: diagResponse.data.suspectedFile,
          line: diagResponse.data.suspectedLine,
          snippet: diagResponse.data.suggestion,
        },
        evidence: {
          testCaseId: test.id,
          failedAssertion: failedAssertion?.description,
          consoleLogs: result.browserLogs || ['[TEST_RUNNER] Assertion exception triggered'],
        },
        repairStatus: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      reports.push(bug);
    }

    this.status = {
      role: 'diagnostician',
      state: 'completed',
      progressPercentage: 100,
      lastMessage: `Isolated ${reports.length} root cause defect(s)`,
      timestamp: new Date().toISOString(),
    };

    return reports;
  }
}

export const diagnosticianAgent = new DiagnosticianAgent();
