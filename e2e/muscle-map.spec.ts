import { test, expect } from '@playwright/test'

test.describe('Muscle Map — MAP-01: Rendering', () => {
  test('page loads with muscle map SVG visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('svg')).toBeVisible()
  })

  test('front view SVG contains muscle path IDs', async ({ page }) => {
    await page.goto('/')
    // At least one muscle path should exist with the slug-based ID convention
    await expect(page.locator('path[id^="muscle-"]').first()).toBeAttached()
  })

  test('SVG has aria-label for accessibility', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })
})

test.describe('Muscle Map — MAP-02: Front/Back Toggle', () => {
  test('Front/Back segmented control is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Front')).toBeVisible()
    await expect(page.locator('text=Back')).toBeVisible()
  })

  test('clicking Back switches to back view', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back')
    await expect(page.locator('svg[aria-label="Back muscle map"]')).toBeVisible()
  })

  test('clicking Front returns to front view', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back')
    await page.click('text=Front')
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })
})

test.describe('Muscle Map — Detail Mode Toggle', () => {
  test('detail mode toggle shows Normal, Advanced, Anatomy', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Normal')).toBeVisible()
    await expect(page.locator('text=Advanced')).toBeVisible()
    await expect(page.locator('text=Anatomy')).toBeVisible()
  })
})

test.describe('Muscle Map — MAP-05: Disambiguation', () => {
  test.skip('disambiguation zoom triggers in Advanced mode for clustered muscles', async ({ page }) => {
    // Requires CLUSTER_MAP to be populated — will be enabled in Plan 05
    await page.goto('/')
    await page.click('text=Advanced')
    // Click a known cluster region — coordinates TBD after SVG authoring
  })
})
