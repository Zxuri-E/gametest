import { GameRuntimeAdapter, TestCase, TestResult, AgentStatus } from '@shared/core';

export interface PlaytesterAgent {
  executeTests(adapter: GameRuntimeAdapter, tests: TestCase[]): Promise<TestResult>;
  getStatus(): AgentStatus;
}

