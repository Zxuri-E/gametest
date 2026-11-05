import { GameSpecification, TestCase, AgentStatus } from '@shared/core';

export interface TestPlannerAgent {
  planTests(spec: GameSpecification): Promise<TestCase[]>;
  getStatus(): AgentStatus;
}

