import { test, expect } from '@playwright/test';

test.describe('Controlled Bug-Repair Acceptance Test (E2E)', () => {
  test('Complete automated loop: Trigger defect -> Diagnostician -> Repair -> Verified-Fixed', async ({ request }) => {
    test.setTimeout(90000);
    // 1. Get project
    const projRes = await request.get('http://localhost:4000/api/projects');
    expect(projRes.ok()).toBeTruthy();
    const projects = await projRes.json();
    expect(projects.length).toBeGreaterThan(0);
    const targetProject = projects.find((p: any) => p.specification?.genre === 'platformer') || projects[0];

    // 2. Trigger deliberate reachability defect
    const triggerRes = await request.post('http://localhost:4000/api/tests/trigger-defect', {
      data: { projectId: targetProject.id },
    });
    expect(triggerRes.ok()).toBeTruthy();
    const defectOutcome = await triggerRes.json();
    expect(defectOutcome.testResult.overallStatus).toBe('failed');
    expect(defectOutcome.bug).toBeDefined();
    expect(defectOutcome.bug.category).toBe('level-reachability');

    const bugId = defectOutcome.bug.id;

    // 3. Trigger autonomous repair
    const repairRes = await request.post(`http://localhost:4000/api/repair/${bugId}`);
    expect(repairRes.ok()).toBeTruthy();
    const repairOutcome = await repairRes.json();
    expect(repairOutcome.success).toBe(true);
    expect(repairOutcome.updatedBug.repairStatus).toBe('verified-fixed');
    expect(repairOutcome.iteration.diffPatch).toContain('PlatformerScene.ts');

    // 4. Run verification to confirm all regression tests pass
    const verifyRes = await request.post('http://localhost:4000/api/tests/run', {
      data: { projectId: targetProject.id },
    });
    expect(verifyRes.ok()).toBeTruthy();
    const verifyOutcome = await verifyRes.json();
    expect(verifyOutcome.overallStatus).toBe('passed');
    expect(verifyOutcome.failedCount).toBe(0);
  });
});

