import { test, expect } from '@playwright/test'

test.describe('FAQ', () => {
  // FAQ-01: FAQ page loads with heading and categories
  test('FAQ page shows heading and category chips', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible()
    // Verify "All" chip is visible and active (has bg-primary class)
    const allChip = page.getByRole('button', { name: 'All', exact: true })
    await expect(allChip).toBeVisible()
    // Verify all 6 category chips are present
    await expect(page.getByRole('button', { name: 'Muscle Pain' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Myths' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nutrition' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Recovery' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Form' })).toBeVisible()
  })

  // FAQ-01: All 20 entries visible with "All" filter
  test('All filter shows all 20 FAQ entries', async ({ page }) => {
    await page.goto('/faq')
    // The first FAQ question text contains "barely walk"
    await expect(page.getByText('I can barely walk after my first workout')).toBeVisible()
    // Count all accordion items — should be 20
    const questions = page.locator('[data-testid="faq-item"]')
    await expect(questions).toHaveCount(20)
  })

  // FAQ-01: Category filter shows only matching entries
  test('Muscle Pain filter shows only muscle-pain entries', async ({ page }) => {
    await page.goto('/faq')
    await page.getByRole('button', { name: 'Muscle Pain' }).click()
    // faq-entries.json has 4 muscle-pain entries
    const questions = page.locator('[data-testid="faq-item"]')
    await expect(questions).toHaveCount(4)
    // First muscle-pain entry should be visible
    await expect(page.getByText('I can barely walk after my first workout')).toBeVisible()
  })

  // FAQ-02: Tapping question expands answer inline
  test('tapping question expands answer inline', async ({ page }) => {
    await page.goto('/faq')
    const firstQuestion = page.getByText('I can barely walk after my first workout')
    // Answer should NOT be visible initially
    await expect(page.getByText('DOMS — Delayed Onset Muscle Soreness')).not.toBeVisible()
    // Click the question
    await firstQuestion.click()
    // Answer should now be visible
    await expect(page.getByText('DOMS — Delayed Onset Muscle Soreness')).toBeVisible()
  })

  // FAQ-02: Answer is hidden when question is collapsed
  test('collapsing question hides answer', async ({ page }) => {
    await page.goto('/faq')
    const firstQuestion = page.getByText('I can barely walk after my first workout')
    // Expand
    await firstQuestion.click()
    await expect(page.getByText('DOMS — Delayed Onset Muscle Soreness')).toBeVisible()
    // Collapse
    await firstQuestion.click()
    await expect(page.getByText('DOMS — Delayed Onset Muscle Soreness')).not.toBeVisible()
  })

  // FAQ tab in BottomNav
  test('FAQ tab is visible in bottom nav', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'FAQ' })).toBeVisible()
  })
})
