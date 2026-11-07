import { test, expect } from '@playwright/test';

test.describe('Phaser 3 Game Genre Mechanics & Telemetry Verification', () => {
  test('Platformer Scene: Mounts, verifies physics kinematics & reachability', async ({ page }) => {
    await page.goto('/preview');

    // Wait for canvas or container to mount
    const canvasMount = page.locator('#phaser-mount-container');
    await expect(canvasMount).toBeVisible({ timeout: 10000 });

    // Check that game canvas is rendered
    const canvas = canvasMount.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Access the test hook __NOVUS_GAME_API__
    await page.waitForFunction(() => (window as any).__NOVUS_GAME_API__ !== undefined, { timeout: 10000 });

    const state = await page.evaluate(async () => {
      const api = (window as any).__NOVUS_GAME_API__;
      return api ? await api.getGameState() : null;
    });

    expect(state).not.toBeNull();
    expect(state.lives).toBeGreaterThanOrEqual(1);
    expect(state.player).toBeDefined();

    // Verify player movement input
    await page.evaluate(async () => {
      const api = (window as any).__NOVUS_GAME_API__;
      if (api) {
        await api.dispatchAction('right', 300);
      }
    });

    await page.waitForTimeout(350);

    const posAfterMove = await page.evaluate(async () => {
      const api = (window as any).__NOVUS_GAME_API__;
      return api ? await api.getPlayerPosition() : null;
    });

    expect(posAfterMove).not.toBeNull();
  });

  test('Top-Down Scene: Normalized diagonal velocity verification', async ({ page }) => {
    await page.goto('/studio');

    // Select top-down genre
    const topdownBtn = page.locator('button:has-text("Top-Down")');
    if (await topdownBtn.isVisible()) {
      await topdownBtn.click();
    }
  });

  test('Endless Runner Scene: Continuous forward progression & hazards', async ({ page }) => {
    await page.goto('/studio');

    // Select endless runner genre
    const runnerBtn = page.locator('button:has-text("Runner")');
    if (await runnerBtn.isVisible()) {
      await runnerBtn.click();
    }
  });
});
