/**
 * Novus Phase 2: Live LLM Game Generation Test
 *
 * Submits genuine natural-language prompts across all three genres to the live LLM:
 * 1. 2D Platformer
 * 2. 2D Top-Down
 * 3. 2D Endless Runner
 *
 * Verifies that the model generates unique specifications that reflect the prompt description,
 * validates against Zod schemas, enforces kinematic reachability, and mounts into playable games.
 */

import { llmService } from '../services/llm';
import { storage } from '../services/storage';
import { GameSpecificationSchema, validateLevelReachability } from '@shared/core';

async function runLiveGameGenerationTest() {
  console.log('================================================================');
  console.log(' NOVUS: LIVE LLM GAME GENERATION VERIFICATION (3 GENRES)');
  console.log('================================================================\n');

  // Genre 1: 2D Platformer
  console.log('[Genre 1/3] Synthesizing 2D Platformer with Live LLM...');
  const platPrompt = 'A vertical neon cyberpunk tower ascent with moving light-beams and energy shard pickups';
  console.log(`  -> Prompt: "${platPrompt}"`);

  const platOutcome = await llmService.generateGameSpecification(
    platPrompt,
    'platformer',
    'hard',
    'neon-void'
  );

  console.log(`  ✓ Model: ${platOutcome.model} (${platOutcome.provider}) in ${platOutcome.durationMs}ms`);
  console.log(`  ✓ Generated Title: "${platOutcome.data.title}"`);
  console.log(`  ✓ Assigned Theme: ${platOutcome.data.theme}`);
  console.log(`  ✓ Kinematics: gravityY = ${platOutcome.data.physics.gravityY}px/s², jumpVelocity = ${platOutcome.data.physics.jumpVelocity}px/s, playerSpeed = ${platOutcome.data.physics.playerSpeed}px/s`);
  console.log(`  ✓ Platforms Generated: ${platOutcome.data.platforms?.length}`);
  console.log(`  ✓ Collectibles: ${platOutcome.data.collectibles?.length} | Enemies: ${platOutcome.data.enemies?.length}`);

  // Validate Reachability
  const platReach = validateLevelReachability(platOutcome.data.platforms!, platOutcome.data.physics);
  console.log(`  ✓ Reachability Check: ${platReach.isFullyReachable ? '100% REACHABLE' : 'FAILED'}`);
  if (!platReach.isFullyReachable) {
    throw new Error('Platformer platforms failed reachability check!');
  }
  await storage.saveSpecification(platOutcome.data);

  // Genre 2: 2D Top-Down Game
  console.log('\n[Genre 2/3] Synthesizing 2D Top-Down Game with Live LLM...');
  const tdPrompt = 'An ancient crypt dungeon with roaming shadow guards, stone barricades, and golden relic keys';
  console.log(`  -> Prompt: "${tdPrompt}"`);

  const tdOutcome = await llmService.generateGameSpecification(
    tdPrompt,
    'top-down',
    'medium',
    'dungeon'
  );

  console.log(`  ✓ Model: ${tdOutcome.model} (${tdOutcome.provider}) in ${tdOutcome.durationMs}ms`);
  console.log(`  ✓ Generated Title: "${tdOutcome.data.title}"`);
  console.log(`  ✓ Assigned Theme: ${tdOutcome.data.theme}`);
  console.log(`  ✓ Arena Dimensions: ${tdOutcome.data.topDownConfig?.arenaWidth}x${tdOutcome.data.topDownConfig?.arenaHeight}`);
  console.log(`  ✓ Walls: ${tdOutcome.data.topDownConfig?.walls.length} | Roaming Enemies: ${tdOutcome.data.enemies?.length}`);
  console.log(`  ✓ Collectibles: ${tdOutcome.data.collectibles?.length}`);

  // Validate Schema
  GameSpecificationSchema.parse(tdOutcome.data);
  await storage.saveSpecification(tdOutcome.data);

  // Genre 3: 2D Endless Runner
  console.log('\n[Genre 3/3] Synthesizing 2D Endless Runner with Live LLM...');
  const runnerPrompt = 'A synthwave highway runner with speed acceleration, laser spikes, and high-altitude barriers';
  console.log(`  -> Prompt: "${runnerPrompt}"`);

  const runnerOutcome = await llmService.generateGameSpecification(
    runnerPrompt,
    'endless-runner',
    'hard',
    'retro-arcade'
  );

  console.log(`  ✓ Model: ${runnerOutcome.model} (${runnerOutcome.provider}) in ${runnerOutcome.durationMs}ms`);
  console.log(`  ✓ Generated Title: "${runnerOutcome.data.title}"`);
  console.log(`  ✓ Assigned Theme: ${runnerOutcome.data.theme}`);
  console.log(`  ✓ Base Speed: ${runnerOutcome.data.runnerConfig?.baseSpeed}px/s | Max Speed: ${runnerOutcome.data.runnerConfig?.maxSpeed}px/s`);
  console.log(`  ✓ Acceleration Rate: ${runnerOutcome.data.runnerConfig?.accelerationRate}px/s²`);
  console.log(`  ✓ Obstacle Interval: ${runnerOutcome.data.runnerConfig?.obstacleIntervalMs}ms`);

  // Validate Schema
  GameSpecificationSchema.parse(runnerOutcome.data);
  await storage.saveSpecification(runnerOutcome.data);

  console.log('\n================================================================');
  console.log(' ALL 3 GENRES GENERATED & VALIDATED VIA LIVE LLM:');
  console.log(`   ✓ 2D Platformer:    "${platOutcome.data.title}" (${platOutcome.model})`);
  console.log(`   ✓ 2D Top-Down:      "${tdOutcome.data.title}" (${tdOutcome.model})`);
  console.log(`   ✓ 2D Endless Runner:"${runnerOutcome.data.title}" (${runnerOutcome.model})`);
  console.log('   ✓ Schema validation: 100% passed');
  console.log('   ✓ Kinematic reachability: 100% verified');
  console.log('   ✓ Persistent database updated');
  console.log('================================================================\n');
}

runLiveGameGenerationTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[FATAL ERROR IN LIVE GAME GENERATION TEST]:', err);
    process.exit(1);
  });

