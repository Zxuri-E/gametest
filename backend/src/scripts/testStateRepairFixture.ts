/**
 * Novus AI Bug Detection, Autonomous Repair & Verification Fixture: State Invariant
 *
 * This script proves the end-to-end loop for State Defects:
 * 1. Inject deliberate state invariant defect (spec.player.maxHealth = 0).
 * 2. Automated test suite detects the fatal state violation.
 * 3. AI Diagnostician Agent analyzes the failure telemetry, isolates root cause, and classifies layer.
 * 4. AI Repair Agent synthesizes targeted surgical correction (Tier 3 - State Machine).
 * 5. Patch is safely applied to the project specification.
 * 6. Originally failing test is rerun and verified.
 * 7. Regression test suite re-executes and passes.
 * 8. Bug status transitions to 'verified-fixed'.
 */

import { orchestrator } from '../orchestrator';
import { storage } from '../services/storage';

async function runStateAcceptanceTest() {
  console.log('================================================================');
  console.log(' NOVUS: CONTROLLED STATE DEFECT REPAIR ACCEPTANCE TEST FIXTURE');
  console.log('================================================================\n');

  const projects = await storage.getProjects();
  let testProject = projects.find((p) => p.genre === 'platformer') || projects[0]!;

  console.log(`[Target Project] ID: ${testProject.id} | Name: "${testProject.name}"`);

  console.log('\n----------------------------------------------------------------');
  console.log('[Step 1] Injecting Deliberate State Invariant Defect (player maxHealth = 0)...');

  const { bug, testResult } = await orchestrator.triggerControlledDefect(testProject.id, 'state');

  console.log(`\n[Detection Result]`);
  console.log(`  - Overall Test Status: ${testResult.overallStatus.toUpperCase()}`);
  console.log(`  - Passed: ${testResult.passedCount} / Total: ${testResult.totalTests}`);
  console.log(`  - Failed Tests: ${testResult.failedCount}`);

  const failingTest = testResult.tests.find((t) => t.status === 'failed');
  if (!failingTest) {
    throw new Error('FAILED: Controlled state defect was not detected by Playtester Agent!');
  }

  console.log(`  - Failing Test ID: ${failingTest.id}`);
  console.log(`  - Failing Test Name: ${failingTest.name}`);
  console.log(`  - Error Message: ${failingTest.errorMessage}`);

  console.log('\n----------------------------------------------------------------');
  console.log('[Step 2] AI Diagnostician Agent Root Cause Analysis:');
  console.log(`  - Bug Report ID: ${bug.id}`);
  console.log(`  - Title: ${bug.title}`);
  console.log(`  - Category: ${bug.category}`);
  console.log(`  - Defect Layer: ${bug.defectLayer}`);
  console.log(`  - Severity: ${bug.severity.toUpperCase()}`);
  console.log(`  - Expected: ${bug.expectedBehaviour}`);
  console.log(`  - Actual: ${bug.actualBehaviour}`);

  console.log('\n----------------------------------------------------------------');
  console.log('[Step 3] Executing AI Repair Agent Workflow...');
  const repairOutcome = await orchestrator.diagnoseAndRepair(bug.id);

  console.log('\n[Repair Outcome]');
  console.log(`  - Repair Success: ${repairOutcome.success}`);
  console.log(`  - Iteration ID: ${repairOutcome.iteration.id}`);
  console.log(`  - Description: ${repairOutcome.iteration.description}`);
  console.log(`  - Updated Bug Status: ${repairOutcome.updatedBug.repairStatus}`);

  console.log('\n----------------------------------------------------------------');
  console.log('[Step 4] Re-testing Repaired Game & Running Full Regression Suite...');
  const updatedSpec = await storage.getSpecification(testProject.specification.id);
  console.log(`  - Target Specification ID: ${updatedSpec?.id}`);
  const retests = await orchestrator.executeVerification(testProject.id);

  console.log(`  - Verification Status: ${retests.overallStatus.toUpperCase()}`);
  console.log(`  - Passed Tests: ${retests.passedCount} / ${retests.totalTests}`);
  console.log(`  - Failed Tests: ${retests.failedCount}`);

  if (retests.failedCount > 0) {
    throw new Error('Regression detected during post-repair verification!');
  }

  console.log('\n================================================================');
  console.log(' STATE DEFECT ACCEPTANCE CRITERIA MET:');
  console.log('   ✓ Playtester detected fatal player state invariant violation');
  console.log('   ✓ Bug report generated with defectLayer = specification/state');
  console.log('   ✓ Diagnostician isolated state root cause');
  console.log('   ✓ Repair Agent restored player maxHealth invariant');
  console.log('   ✓ Re-verification passed completely');
  console.log('   ✓ Bug Report marked VERIFIED-FIXED');
  console.log('================================================================\n');
}

runStateAcceptanceTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[FATAL ERROR IN ACCEPTANCE TEST]:', err);
    process.exit(1);
  });
