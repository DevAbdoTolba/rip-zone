/**
 * Regression tests for the snapshot-based PR detection in WorkoutLogger.
 *
 * These tests do NOT render WorkoutLogger (too many dependencies for a unit test).
 * Instead, they validate the snapshot contract that WorkoutLogger must uphold:
 *
 *   1. Capture a baseline PRMap ONCE before the current session writes to Dexie
 *   2. Check isNewPR against that FROZEN baseline for all subsequent sets
 *
 * The bug was: WorkoutLogger re-queried Dexie after each confirmSet, causing
 * the baseline to include the just-confirmed set. Since isNewPR uses strict >,
 * a set of 90kg would see 90kg in the "historical" data and return false.
 *
 * The fix: freeze the baseline at exercise-add time and never re-query.
 */

import { describe, test, expect } from 'vitest'
import { computePRs, isNewPR } from '@/lib/pr-detection'

describe('Snapshot-based PR detection contract', () => {
  test('Test 1 (snapshot isolation): isNewPR returns true when new weight beats frozen baseline', () => {
    // Simulate historical data captured BEFORE the current session
    const historicalSets = [
      { reps: 5, weightKg: 80 },
      { reps: 10, weightKg: 60 },
    ]
    const baseline = computePRs(historicalSets)

    // New set beats 5-rep best of 80kg
    expect(isNewPR({ reps: 5, weightKg: 90 }, baseline)).toBe(true)

    // KEY: In the snapshot approach, the baseline is NOT recomputed after confirming the new set.
    // Even if we simulate confirming 90kg, the baseline stays frozen at 80kg.
    // This means a second set at 95kg also shows as PR (beats 80, not 90).
    // The baseline stays frozen — it still shows 80kg for 5 reps.
    expect(baseline.get(5)).toBe(80)
  })

  test('Test 2 (equal weight not a PR): isNewPR returns false when weight exactly matches historical best', () => {
    const historicalSets = [{ reps: 5, weightKg: 80 }]
    const baseline = computePRs(historicalSets)

    // Strict > contract: equal weight is NOT a PR
    expect(isNewPR({ reps: 5, weightKg: 80 }, baseline)).toBe(false)
  })

  test('Test 3 (first-ever set is a PR): empty historical baseline means any set is a PR', () => {
    // No prior history for this exercise
    const emptyBaseline = computePRs([])

    // First-ever set for this rep count — no prior record exists
    expect(isNewPR({ reps: 10, weightKg: 50 }, emptyBaseline)).toBe(true)
    expect(isNewPR({ reps: 5, weightKg: 100 }, emptyBaseline)).toBe(true)
    expect(isNewPR({ reps: 1, weightKg: 150 }, emptyBaseline)).toBe(true)
  })

  test('Test 4 (multiple PRs in one session): both sets beat the same frozen baseline', () => {
    const historicalSets = [{ reps: 5, weightKg: 80 }]
    const baseline = computePRs(historicalSets)

    // Set 1 in session: 85kg at 5 reps — beats 80kg baseline
    expect(isNewPR({ reps: 5, weightKg: 85 }, baseline)).toBe(true)

    // In the snapshot approach, baseline is NOT updated to 85kg after set 1.
    // Set 2 in session: 95kg at 5 reps — also beats the frozen 80kg baseline
    expect(isNewPR({ reps: 5, weightKg: 95 }, baseline)).toBe(true)

    // Verify baseline is still frozen at 80 (not 85 or 95)
    expect(baseline.get(5)).toBe(80)
  })

  test('non-PR sets mixed with PR sets use same baseline', () => {
    const historicalSets = [
      { reps: 5, weightKg: 100 },
      { reps: 10, weightKg: 70 },
    ]
    const baseline = computePRs(historicalSets)

    // Beats 5-rep best: PR
    expect(isNewPR({ reps: 5, weightKg: 110 }, baseline)).toBe(true)
    // Does NOT beat 5-rep best (equal): not a PR
    expect(isNewPR({ reps: 5, weightKg: 100 }, baseline)).toBe(false)
    // Does NOT beat 5-rep best (lower): not a PR
    expect(isNewPR({ reps: 5, weightKg: 90 }, baseline)).toBe(false)
    // Beats 10-rep best: PR
    expect(isNewPR({ reps: 10, weightKg: 75 }, baseline)).toBe(true)
    // New rep count not in history: PR
    expect(isNewPR({ reps: 3, weightKg: 120 }, baseline)).toBe(true)
  })

  test('baseline correctly reflects the best weight per rep count from historical data', () => {
    // Multiple sets for same rep count — baseline takes the best
    const historicalSets = [
      { reps: 5, weightKg: 60 },
      { reps: 5, weightKg: 80 },  // best for 5 reps
      { reps: 5, weightKg: 70 },
      { reps: 10, weightKg: 50 }, // only one for 10 reps
    ]
    const baseline = computePRs(historicalSets)

    // 5-rep baseline is 80 (the best, not the last)
    expect(baseline.get(5)).toBe(80)
    // 10-rep baseline is 50
    expect(baseline.get(10)).toBe(50)

    // 81kg beats 80kg baseline
    expect(isNewPR({ reps: 5, weightKg: 81 }, baseline)).toBe(true)
    // 80kg equals baseline — not a PR
    expect(isNewPR({ reps: 5, weightKg: 80 }, baseline)).toBe(false)
  })
})
