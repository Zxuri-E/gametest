/**
 * Runtime contracts, event definitions, and protocol standards.
 */

import { GameSpecification, GameState, TestCase, TestResult, BugReport, RepairIteration } from '../types';

export interface GameEngineEvents {
  'game:ready': () => void;
  'game:start': () => void;
  'game:pause': () => void;
  'game:resume': () => void;
  'game:state-update': (state: GameState) => void;
  'game:error': (error: Error) => void;
  'game:over': (details: { finalScore: number; reason: string }) => void;
}

export interface AgentOrchestratorContract {
  generateGame(prompt: string, spec: Partial<GameSpecification>): Promise<GameSpecification>;
  generateTestSuite(spec: GameSpecification): Promise<TestCase[]>;
  executeTestSuite(spec: GameSpecification, tests: TestCase[]): Promise<TestResult>;
  diagnoseFailure(testResult: TestResult, codeSnippet: string): Promise<BugReport[]>;
  attemptRepair(bug: BugReport, currentCode: string): Promise<RepairIteration>;
}
