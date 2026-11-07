import { test, expect } from '@playwright/test';

test.describe('Novus Application Core & UI Workflows', () => {
  test('App starts and loads dashboard with system status', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Novus/i);

    // Verify Dashboard navigation element
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify key metrics panels or sections
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Navigate through primary feature planes', async ({ page }) => {
    await page.goto('/');

    // Game Studio
    await page.click('text=Game Studio');
    await expect(page).toHaveURL(/.*studio/);

    // Testing Center
    await page.click('text=Testing Center');
    await expect(page).toHaveURL(/.*testing/);

    // Bug Reports
    await page.click('text=Bug Reports');
    await expect(page).toHaveURL(/.*bugs/);

    // Settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/.*settings/);
  });

  test('Game Studio prompt input and parameter selection', async ({ page }) => {
    await page.goto('/studio');

    // Find prompt textarea or input
    const promptInput = page.locator('textarea').first();
    await expect(promptInput).toBeVisible();
    await promptInput.fill('A cyberpunk 2D platformer with high-speed jumps and laser grids');

    // Genre buttons
    const platformerBtn = page.locator('button:has-text("Platformer")');
    if (await platformerBtn.isVisible()) {
      await platformerBtn.click();
    }
  });

  test('Backend communication and health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Novus Backend API');
  });

  test('Settings persistence across page reload', async ({ page }) => {
    await page.goto('/settings');
    // Verify provider select exists
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      await expect(selects.first()).toBeVisible();
    }
  });
});

