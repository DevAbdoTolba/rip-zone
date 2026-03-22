import { test, expect } from '@playwright/test'

test.describe('Phase 1 Smoke Test', () => {
  test('page loads with Rip Zone heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Rip Zone')
  })

  test('page shows Foundation loaded subtitle', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Foundation loaded')).toBeVisible()
  })

  test('page shows MongoDB status label', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=MongoDB')).toBeVisible()
  })

  test('page shows Local DB status label', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Local DB')).toBeVisible()
  })

  test('page shows Reference data status label', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Reference data')).toBeVisible()
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
