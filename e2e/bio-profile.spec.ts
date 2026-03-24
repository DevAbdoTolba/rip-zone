import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3001/')
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases()
    await Promise.all(
      dbs.map(
        db => new Promise<void>((resolve, reject) => {
          if (!db.name) { resolve(); return }
          const req = indexedDB.deleteDatabase(db.name)
          req.onsuccess = () => resolve()
          req.onerror = () => reject(req.error)
        })
      )
    )
  })
})

// BIO-01: Profile page loads with all 6 fields
test('profile page shows heading and 6 input fields', async ({ page }) => {
  await page.goto('http://localhost:3001/profile')
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  // Verify all 6 field labels
  await expect(page.getByText('Height (cm)')).toBeVisible()
  await expect(page.getByText('Weight (kg)')).toBeVisible()
  await expect(page.getByText('Age')).toBeVisible()
  await expect(page.getByText('Body Fat (%)')).toBeVisible()
  await expect(page.getByText('Waist (cm)')).toBeVisible()
  // Gender is a button group
  await expect(page.getByRole('button', { name: 'Male', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Female', exact: true })).toBeVisible()
})

// BIO-01: Saving bio data persists across reload
test('saved bio data persists after page reload', async ({ page }) => {
  await page.goto('http://localhost:3001/profile')
  // Fill in height
  const heightInput = page.getByLabel('Height (cm)')
  await heightInput.fill('175')
  // Fill in weight
  const weightInput = page.getByLabel('Weight (kg)')
  await weightInput.fill('80')
  // Save
  await page.getByRole('button', { name: 'Save Profile' }).click()
  // Wait for save confirmation
  await expect(page.getByText('Saved!')).toBeVisible()
  // Reload
  await page.reload()
  // Wait for data to load
  await expect(page.getByLabel('Height (cm)')).toHaveValue('175')
  await expect(page.getByLabel('Weight (kg)')).toHaveValue('80')
})

// BIO-02: Accuracy ring shows 0% with no data
test('accuracy ring shows 0% with no bio data', async ({ page }) => {
  await page.goto('http://localhost:3001/profile')
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases()
    await Promise.all(
      dbs.map(
        db => new Promise<void>((resolve, reject) => {
          if (!db.name) { resolve(); return }
          const req = indexedDB.deleteDatabase(db.name)
          req.onsuccess = () => resolve()
          req.onerror = () => reject(req.error)
        })
      )
    )
  })
  await page.reload()
  await expect(page.getByLabel('Accuracy 0%')).toBeVisible()
})

// BIO-03: All features accessible with zero bio data (smoke test)
test('all features accessible with zero bio data', async ({ page }) => {
  // 1. Map page loads
  await page.goto('http://localhost:3001/')
  await expect(page.getByRole('heading', { name: 'Rip Zone' })).toBeVisible()

  // 2. Exercises page loads
  await page.goto('http://localhost:3001/exercises')
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()

  // 3. History page loads
  await page.goto('http://localhost:3001/history')
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible()

  // 4. Ranking page loads
  await page.goto('http://localhost:3001/ranking')
  await expect(page.getByRole('heading', { name: 'Ranking' })).toBeVisible()

  // 5. FAQ page loads
  await page.goto('http://localhost:3001/faq')
  await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible()

  // 6. Profile page loads
  await page.goto('http://localhost:3001/profile')
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

  // Verify NO prompts, gates, or banners appear
  await expect(page.getByText(/complete your profile/i)).not.toBeVisible()
  await expect(page.getByText(/add your bio/i)).not.toBeVisible()
})

// BIO-03: No prompt or gate without bio data
test('no prompt or gate appears without bio data', async ({ page }) => {
  // Navigate through all main features
  const routes = ['http://localhost:3001/', 'http://localhost:3001/exercises', 'http://localhost:3001/history', 'http://localhost:3001/ranking', 'http://localhost:3001/faq']
  for (const route of routes) {
    await page.goto(route)
    // No modal, dialog, or banner linking to /profile should appear
    const profileLinks = page.locator('a[href="/profile"]')
    // Only the nav link should exist, not a prompt/banner
    // Count profile links — should be at most the nav links (mobile + desktop = 2)
    const count = await profileLinks.count()
    expect(count).toBeLessThanOrEqual(2)
  }
})
