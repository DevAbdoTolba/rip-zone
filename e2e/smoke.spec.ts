import { test, expect } from '@playwright/test'

test.describe('Phase 1 Smoke Test', () => {
  test('page loads with Rip Zone heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Rip Zone')
  })

  test('page shows muscle map SVG', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })

  test('page shows bottom navigation with Map and Exercises tabs', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Map' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Exercises' }).first()).toBeVisible()
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    // Wait for status badges to resolve (API calls + Dexie init)
    await page.waitForTimeout(3000)

    // Filter out known Next.js development warnings that are not app errors
    const appErrors = errors.filter(
      (e) =>
        !e.includes('Download the React DevTools') &&
        !e.includes('Warning:') &&
        !e.includes('was preloaded using link preload')
    )

    expect(appErrors).toEqual([])
  })
})
