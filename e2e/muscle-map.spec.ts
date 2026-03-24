import { test, expect } from '@playwright/test'

test.describe('Muscle Map — MAP-01: Rendering', () => {
  test('page loads with muscle map SVG visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })

  test('front view SVG contains muscle paths', async ({ page }) => {
    await page.goto('/')
    // SVG contains path elements for muscle shapes (IDs stripped by SVGO during build)
    const pathCount = await page.evaluate(() => {
      const svg = document.querySelector('svg[aria-label="Front muscle map"]')
      return svg ? svg.querySelectorAll('path').length : 0
    })
    expect(pathCount).toBeGreaterThan(0)
  })

  test('SVG has aria-label for accessibility', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })

  test('page shows Rip Zone heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Rip Zone')
  })
})

test.describe('Muscle Map — MAP-02: Front/Back Toggle', () => {
  test('Front/Back segmented control is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Front' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  })

  test('Front button has aria-pressed=true by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Front' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('clicking Back switches to back view SVG', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.locator('svg[aria-label="Back muscle map"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('clicking Front returns to front view', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: 'Front' }).click()
    await expect(page.locator('svg[aria-label="Front muscle map"]')).toBeVisible()
  })
})

test.describe('Muscle Map — Detail Mode Toggle', () => {
  test('detail mode toggle shows Normal, Advanced, Anatomy', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Normal' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Advanced' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Anatomy' })).toBeVisible()
  })

  test('Normal is active by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('switching to Advanced mode changes visible SVG', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Advanced' }).click()
    await expect(page.getByRole('button', { name: 'Advanced' })).toHaveAttribute('aria-pressed', 'true')
    // Advanced mode SVG should still show muscle paths (IDs stripped by SVGO)
    const pathCount = await page.evaluate(() => {
      const container = document.querySelector('[data-detail-mode="advanced"]')
      const svg = container?.querySelector('svg')
      return svg ? svg.querySelectorAll('path').length : 0
    })
    expect(pathCount).toBeGreaterThan(0)
  })
})

test.describe('Muscle Map — Muscle Selection', () => {
  test('clicking a muscle path highlights it', async ({ page }) => {
    await page.goto('/')
    // Click on a hit target (pectoralis major is a large, reliable target)
    // Use dispatchEvent: SVG hit targets have transparent fill so Playwright's
    // viewport-based click is intercepted by the parent SVG element
    const hitTarget = page.locator('path[id="hit-muscle-pectoralis-major"]')
    if (await hitTarget.count() > 0) {
      await hitTarget.dispatchEvent('click')
      // Check that the visual path got selected attribute
      await expect(page.locator('path[id="muscle-pectoralis-major"][data-selected="true"]')).toBeAttached()
    }
  })
})

test.describe('Muscle Map — MAP-05: Disambiguation', () => {
  test('Normal mode does not trigger disambiguation', async ({ page }) => {
    await page.goto('/')
    // In Normal mode, clicking any muscle should select directly, not zoom
    // Use dispatchEvent: SVG hit targets have transparent fill so Playwright's
    // viewport-based click is intercepted by the parent SVG element
    const hitTarget = page.locator('path[id^="hit-muscle-"]').first()
    if (await hitTarget.count() > 0) {
      await hitTarget.dispatchEvent('click')
      // No disambiguation overlay should appear
      await expect(page.locator('.disambiguation-overlay')).not.toBeVisible()
    }
  })
})

test.describe('Muscle Map — No Console Errors', () => {
  test('no console errors on page load and interaction', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForTimeout(2000)

    // Toggle views
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: 'Front' }).click()

    // Toggle modes
    await page.getByRole('button', { name: 'Advanced' }).click()
    await page.getByRole('button', { name: 'Normal' }).click()

    await page.waitForTimeout(1000)

    const appErrors = errors.filter(
      (e) =>
        !e.includes('Download the React DevTools') &&
        !e.includes('Warning:') &&
        !e.includes('was preloaded using link preload')
    )

    expect(appErrors).toEqual([])
  })
})

// Helper: dispatch a synthetic click on an SVG hit-layer path.
// SVG hit targets use `pointer-events: all` with transparent fill, but Playwright's
// viewport-based click is intercepted by the parent SVG element. Using dispatchEvent
// bypasses this by firing directly on the target element via the DOM event system,
// which React's event delegation correctly processes.
async function clickMuscle(page: Parameters<typeof test>[1]['page'], muscleSlug: string) {
  await page.locator(`path[id="hit-muscle-${muscleSlug}"]`).dispatchEvent('click')
}

test.describe('Muscle Map — MAP-04: Muscle Detail Panel', () => {
  test('clicking a muscle opens the detail panel', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Panel should show the muscle display name
    await expect(panel).toContainText('Pectoralis Major')
  })

  test('panel shows exercises targeting the selected muscle', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Should show "Exercises" section heading
    await expect(panel.locator('[data-testid="panel-exercise-list"] h3')).toContainText('Exercises')
    // Pectoralis major has multiple exercises — at least one should appear
    // Flat Bench Press is a primary exercise for pectoralis-major
    await expect(panel).toContainText('Flat Bench Press')
  })

  test('panel shows strain status for the selected muscle', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Strain status card should be visible
    const strainCard = panel.locator('[data-testid="strain-status-card"]')
    await expect(strainCard).toBeVisible()
    // Should contain the "Recovery Status" heading
    await expect(strainCard).toContainText('Recovery Status')
    // Should contain a strain level text (at minimum "Rested" for a fresh DB)
    await expect(strainCard).toContainText(/Rested|Light strain|Moderate strain|Heavy strain|Strained/)
  })

  test('panel closes when X button is clicked', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Click the close button
    await page.locator('button[aria-label="Close muscle panel"]').click()
    await expect(panel).not.toBeVisible()
  })

  test('panel closes when view is toggled', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Toggle to Back view
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(panel).not.toBeVisible()
  })

  test('tapping same muscle again closes the panel', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    // Click same muscle again — should deselect
    await clickMuscle(page, 'pectoralis-major')
    await expect(panel).not.toBeVisible()
  })

  test('"View all exercises" link navigates to filtered exercise library', async ({ page }) => {
    await page.goto('/')
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toBeVisible()
    const link = panel.locator('a:has-text("View all exercises")')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/exercises?muscle=pectoralis-major')
  })

  test('tapping a different muscle switches panel content', async ({ page }) => {
    await page.goto('/')
    // Click pectoralis major first
    await clickMuscle(page, 'pectoralis-major')
    const panel = page.locator('[data-testid="muscle-panel"]')
    await expect(panel).toContainText('Pectoralis Major')
    // Click rectus abdominis (different muscle on front view)
    await clickMuscle(page, 'rectus-abdominis')
    await expect(panel).toContainText('Rectus Abdominis')
  })
})
