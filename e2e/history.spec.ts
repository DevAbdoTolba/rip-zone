import { test, expect } from '@playwright/test'

// Helper: seed a completed workout session directly into IndexedDB via Dexie
async function seedCompletedWorkout(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    // Use Dexie API available on the page via dynamic import
    const { workoutsDb } = await import('/src/lib/db/workouts.ts' as any)
    const sessionId = crypto.randomUUID()
    const exerciseLogId = crypto.randomUUID()
    const now = Date.now()

    await workoutsDb.sessions.put({
      id: sessionId,
      startedAt: now - 3600_000, // 1 hour ago
      completedAt: now,
      planId: null,
    })
    await workoutsDb.exercisesInSession.put({
      id: exerciseLogId,
      sessionId,
      exerciseSlug: 'flat-bench-press',
      orderIndex: 0,
    })
    await workoutsDb.sets.put({
      id: crypto.randomUUID(),
      exerciseInSessionId: exerciseLogId,
      setNumber: 1,
      reps: 10,
      weightKg: 80,
      completedAt: now,
    })
  })
}

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all IndexedDB data before each test for isolation
    await page.goto('/history')
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

  test('shows empty state when no workouts', async ({ page }) => {
    await page.goto('/history')
    // Wait for loading to finish
    await expect(page.getByText(/loading history/i)).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/no workouts yet/i)).toBeVisible()
  })

  test('shows logged workout after completing a freestyle session', async ({ page }) => {
    // Log a workout via the workout page
    await page.goto('/workout')

    // Clear DB on first load
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

    // Start workout
    await page.getByRole('button', { name: /start freestyle workout/i }).click()

    // Add an exercise
    await page.getByRole('button', { name: /add exercise/i }).click()
    await expect(page.getByPlaceholder(/search exercises/i)).toBeVisible()
    const firstExercise = page.locator('ul li button').first()
    await firstExercise.click()

    // Confirm a set
    await page.getByRole('button', { name: /confirm set/i }).click()

    // Finish the workout
    await page.getByRole('button', { name: /finish/i }).click()

    // Navigate to history
    await page.goto('/history')

    // Wait for loading to finish
    await expect(page.getByText(/loading history/i)).not.toBeVisible({ timeout: 5000 })

    // A session row should appear (not empty state)
    await expect(page.getByText(/no workouts yet/i)).not.toBeVisible()
    // Session timeline should have at least one session
    await expect(page.locator('[data-testid="session-row"]').or(page.locator('text=sets').first())).toBeVisible()
  })

  test('data persists across page reload (WORK-06 offline persistence)', async ({ page }) => {
    // Log a workout via the workout page
    await page.goto('/workout')

    // Clear DB
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

    // Start workout, add exercise, confirm set, finish
    await page.getByRole('button', { name: /start freestyle workout/i }).click()
    await page.getByRole('button', { name: /add exercise/i }).click()
    await expect(page.getByPlaceholder(/search exercises/i)).toBeVisible()
    await page.locator('ul li button').first().click()
    await page.getByRole('button', { name: /confirm set/i }).click()
    await page.getByRole('button', { name: /finish/i }).click()

    // Navigate to history — should show session
    await page.goto('/history')
    await expect(page.getByText(/loading history/i)).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/no workouts yet/i)).not.toBeVisible()

    // Reload the page — data should persist
    await page.reload()
    await expect(page.getByText(/loading history/i)).not.toBeVisible({ timeout: 5000 })

    // Session should still be visible after reload (IndexedDB persistence)
    await expect(page.getByText(/no workouts yet/i)).not.toBeVisible()
  })
})
