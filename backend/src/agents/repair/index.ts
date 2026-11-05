import { BugReport, RepairIteration, AgentStatus } from '@shared/core';

export interface RepairAgent {
  attemptRepair(bug: BugReport, sourceCode: string): Promise<RepairIteration>;
  getStatus(): AgentStatus;
}

