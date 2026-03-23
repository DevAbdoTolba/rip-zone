import { test, expect } from '@playwright/test'

test.describe('Exercise Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exercises')
  })

  test('EXER-01: displays page title and exercise count', async ({ page }) => {
    // Page title visible
    await expect(page.locator('h1')).toHaveText('Exercises')
    // At least one exercise card is visible
    await expect(page.locator('[data-testid="exercise-card"]').first()).toBeVisible()
  })

  test('EXER-01: exercises grouped by muscle group sections', async ({ page }) => {
    // Check for known muscle group section headings (h2 elements)
    await expect(page.locator('h2', { hasText: 'Chest' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Back' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Legs' })).toBeVisible()
  })

  test('EXER-01: exercise card expands to Level 1 on click', async ({ page }) => {
    // Click first exercise card
    const firstCard = page.locator('[data-testid="exercise-card"]').first()
    await firstCard.click()
    // Level 1 content should be visible: view-warmup badge and More button
    await expect(firstCard.locator('[data-testid="view-warmup-badge"]')).toBeVisible()
    await expect(firstCard.locator('button', { hasText: 'More' })).toBeVisible()
  })

  test('EXER-01: exercise card expands to Level 2 with form cues', async ({ page }) => {
    // Click first card to Level 1
    const firstCard = page.locator('[data-testid="exercise-card"]').first()
    await firstCard.click()
    // Click "More" to Level 2
    await firstCard.locator('button', { hasText: 'More' }).click()
    // Level 2 content should appear: Form Cues heading (exercises always have form cues)
    await expect(firstCard.locator('h4', { hasText: 'Form Cues' }).first()).toBeVisible()
    // Less button should be visible
    await expect(firstCard.locator('button', { hasText: 'Less' })).toBeVisible()
  })

  test('EXER-02: search filters exercises by name', async ({ page }) => {
    // Type into search bar (placeholder uses ellipsis: "Search exercises…")
    const searchInput = page.getByPlaceholder('Search exercises…')
    await searchInput.fill('bench')
    // Wait for filtering
    await page.waitForTimeout(100)
    // Visible exercise cards should contain "bench" in their text
    const cards = page.locator('[data-testid="exercise-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(110) // filtered down from 110
    // All visible exercise names should contain "bench" (case-insensitive)
    for (let i = 0; i < count; i++) {
      const name = await cards.nth(i).locator('[data-testid="exercise-name"]').textContent()
      expect(name?.toLowerCase()).toContain('bench')
    }
  })

  test('EXER-02: equipment filter chips work', async ({ page }) => {
    // Click "Barbell" filter chip (native button)
    await page.locator('button', { hasText: 'Barbell' }).first().click()
    // Wait for filtering
    await page.waitForTimeout(100)
    // Expand first card to verify equipment badge
    const firstCard = page.locator('[data-testid="exercise-card"]').first()
    await firstCard.click()
    await expect(firstCard.locator('[data-testid="equipment-badge"]')).toContainText('Barbell')
  })

  test('EXER-02: empty state shows when no results match', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search exercises…')
    await searchInput.fill('xyznonexistentexercise')
    await page.waitForTimeout(100)
    await expect(page.getByText('No exercises found, habibi')).toBeVisible()
    await expect(page.getByText('Clear filters')).toBeVisible()
  })

  test('EXER-02: clear filters button resets all filters', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search exercises…')
    await searchInput.fill('xyznonexistentexercise')
    await page.waitForTimeout(100)
    await page.getByText('Clear filters').click()
    await page.waitForTimeout(100)
    // Exercise cards should be visible again
    await expect(page.locator('[data-testid="exercise-card"]').first()).toBeVisible()
  })

  test('EXER-03: warm-up sheet opens from exercise card', async ({ page }) => {
    // Click first card to expand to Level 1
    const firstCard = page.locator('[data-testid="exercise-card"]').first()
    await firstCard.click()
    // Click "View warm-up" badge
    await firstCard.locator('[data-testid="view-warmup-badge"]').click()
    // Warm-up sheet should be visible with header containing "Warm-up"
    await expect(page.locator('[data-testid="warmup-sheet"]')).toBeVisible()
    // The Dialog.Title contains "{MuscleGroup} Warm-up" text (h2 element)
    await expect(page.locator('[data-testid="warmup-sheet"]').locator('h2')).toBeVisible()
  })

  test('EXER-03: warm-up sheet shows movements with instructions', async ({ page }) => {
    const firstCard = page.locator('[data-testid="exercise-card"]').first()
    await firstCard.click()
    await firstCard.locator('[data-testid="view-warmup-badge"]').click()
    // Should see numbered movements (at least 1)
    await expect(page.locator('[data-testid="warmup-movement"]').first()).toBeVisible()
    // Close button should work
    await page.locator('[data-testid="warmup-sheet"]').getByText('Close').click()
    // Sheet should be dismissed
    await expect(page.locator('[data-testid="warmup-sheet"]')).not.toBeVisible()
  })

  test('bottom nav has Map and Exercises tabs', async ({ page }) => {
    // Desktop nav (hidden md:flex) is visible at default 1280px viewport
    // Check that nav links for Map and Exercises exist and at least one is accessible
    await expect(page.locator('a[href="/"]').first()).toBeAttached()
    await expect(page.locator('a[href="/exercises"]').first()).toBeAttached()
    // Verify the link text content
    const mapLinks = await page.locator('a[href="/"]').all()
    const mapTexts = await Promise.all(mapLinks.map(l => l.textContent()))
    expect(mapTexts.some(t => t?.includes('Map'))).toBeTruthy()
    const exLinks = await page.locator('a[href="/exercises"]').all()
    const exTexts = await Promise.all(exLinks.map(l => l.textContent()))
    expect(exTexts.some(t => t?.includes('Exercises'))).toBeTruthy()
  })

  test('bottom nav navigates between Map and Exercises', async ({ page }) => {
    // Use desktop nav (visible at 1280px default viewport — hidden md:flex)
    // The desktop nav is the second nav element
    const desktopNav = page.locator('nav').nth(1)
    // Navigate to Map
    await desktopNav.locator('a[href="/"]').click()
    await expect(page).toHaveURL('/')
    // Navigate back to Exercises
    await desktopNav.locator('a[href="/exercises"]').click()
    await expect(page).toHaveURL('/exercises')
  })
})
