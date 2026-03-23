import { test, expect } from '@playwright/test'

test.describe('Exercise Library', () => {
  test('EXER-01: displays exercises grouped by muscle group', async ({ page }) => {
    await page.goto('/exercises')
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
    // Expect at least one muscle group section heading
    await expect(page.getByRole('heading', { name: 'Chest' })).toBeVisible()
    // Expect at least one exercise card to be visible
    await expect(page.locator('[data-testid="exercise-card"]').first()).toBeVisible()
  })

  test('EXER-02: search filters exercises by name', async ({ page }) => {
    await page.goto('/exercises')
    await page.getByPlaceholder('Search exercises…').fill('bench')
    // Only exercises containing "bench" should be visible
    const cards = page.locator('[data-testid="exercise-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    // All visible exercise names should contain "bench"
    for (let i = 0; i < count; i++) {
      const name = await cards.nth(i).locator('[data-testid="exercise-name"]').textContent()
      expect(name?.toLowerCase()).toContain('bench')
    }
  })

  test('EXER-02: equipment filter works', async ({ page }) => {
    await page.goto('/exercises')
    await page.getByRole('button', { name: 'Barbell' }).click()
    // Cards start collapsed — expand first card to verify equipment badge
    await page.locator('[data-testid="exercise-card"]').first().click()
    // Visible equipment badges should show Barbell
    const equipmentBadges = page.locator('[data-testid="equipment-badge"]')
    const count = await equipmentBadges.count()
    expect(count).toBeGreaterThan(0)
    await expect(equipmentBadges.first()).toContainText('Barbell')
  })

  test('EXER-03: warm-up sheet opens for muscle group', async ({ page }) => {
    await page.goto('/exercises')
    // Cards start collapsed — expand first card to Level 1 to access warm-up badge
    await page.locator('[data-testid="exercise-card"]').first().click()
    // Click "View warm-up" badge on the first exercise card
    await page.locator('[data-testid="view-warmup-badge"]').first().click()
    // Expect bottom sheet with warm-up movements to appear
    await expect(page.locator('[data-testid="warmup-sheet"]')).toBeVisible()
    // Expect at least one warm-up movement to be listed
    await expect(page.locator('[data-testid="warmup-movement"]').first()).toBeVisible()
  })
})
