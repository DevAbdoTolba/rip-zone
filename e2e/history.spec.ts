import { test, expect } from '@playwright/test'

test.describe('History Page', () => {
  test('shows empty state when no workouts', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(/no workouts/i)).toBeVisible()
  })

  test.skip('shows contribution graph after logging workout', async ({ page }) => {
    // Will be implemented after full integration
  })

  test.skip('shows session in reverse chronological order', async ({ page }) => {
    // Will be implemented after full integration
  })

  test.skip('data persists across page reload', async ({ page }) => {
    // WORK-06 verification
  })
})
