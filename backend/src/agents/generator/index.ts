import { GameSpecification, AgentStatus } from '@shared/core';

export interface GeneratorAgent {
  generate(prompt: string): Promise<GameSpecification>;
  getStatus(): AgentStatus;
}

