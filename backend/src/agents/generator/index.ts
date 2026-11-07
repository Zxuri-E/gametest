import {
  GameSpecification,
  GameGenre,
  DifficultyLevel,
  VisualTheme,
  AgentStatus,
  GameSpecificationSchema,
} from '@shared/core';
import { llmService } from '../../services/llm';
import { storage } from '../../services/storage';

export class GeneratorAgent {
  private status: AgentStatus = {
    role: 'generator',
    state: 'idle',
    lastMessage: 'Ready to generate 2D game specifications.',
    timestamp: new Date().toISOString(),
  };

  public getStatus(): AgentStatus {
    return { ...this.status };
  }

  async generate(
    prompt: string,
    genre: GameGenre = 'platformer',
    difficulty: DifficultyLevel = 'medium',
    theme?: VisualTheme
  ): Promise<GameSpecification> {
    this.status = {
      role: 'generator',
      state: 'analyzing',
      currentTask: 'Extracting gameplay intent & kinematics parameters from prompt',
      progressPercentage: 25,
      lastMessage: `Analyzing natural language prompt: "${prompt.slice(0, 40)}..."`,
      timestamp: new Date().toISOString(),
    };

    this.status = {
      role: 'generator',
      state: 'synthesizing',
      currentTask: 'Synthesizing Phaser 3 scene structure & reachability calculations',
      progressPercentage: 65,
      lastMessage: 'Computing jump trajectory curves and platform reachability matrix',
      timestamp: new Date().toISOString(),
    };

    const response = await llmService.generateGameSpecification(prompt, genre, difficulty, theme);
    const spec = response.data;

    // Validate using Zod schema
    const parseResult = GameSpecificationSchema.safeParse(spec);
    if (!parseResult.success) {
      this.status = {
        role: 'generator',
        state: 'error',
        lastMessage: `Schema validation failed: ${parseResult.error.message}`,
        timestamp: new Date().toISOString(),
      };
      throw new Error(`Game specification validation failed: ${parseResult.error.message}`);
    }

    // Persist to storage
    await storage.saveSpecification(spec);

    this.status = {
      role: 'generator',
      state: 'completed',
      progressPercentage: 100,
      lastMessage: `Successfully synthesized ${spec.title} (v${spec.version})`,
      timestamp: new Date().toISOString(),
    };

    return spec;
  }
}

export const generatorAgent = new GeneratorAgent();
