import { TestResult, BugReport, AgentStatus } from '@shared/core';

export interface DiagnosticianAgent {
  diagnose(result: TestResult, code: string): Promise<BugReport[]>;
  getStatus(): AgentStatus;
}

