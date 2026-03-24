import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'

/** Represents a single exercise dose applied to a muscle in a workout session. */
export interface WorkoutMuscleDose {
  /** Which muscle was worked */
  muscleSlug: MuscleSlug
  /** sets x reps x weightKg — pre-calculated by caller */
  volume: number
  /** 1.0 for primary muscles, 0.4 for secondary muscles */
  multiplier: number
  /** Unix ms timestamp of session completion */
  completedAt: number
}

/** Exponential decay half-life: 72 hours */
const HALF_LIFE_MS = 72 * 60 * 60 * 1000

/**
 * Tuning constant: ~5 sets x 10 reps x 100kg = "full strain at moment of completion".
 * A volume of 5000 with multiplier 1.0 at time=now produces exactly 100% normalized strain.
 */
const NORMALIZE_DIVISOR = 5000

/** Strain level thresholds on a 0–100 normalized scale */
const THRESHOLDS = {
  Light: 20,
  Moderate: 40,
  Heavy: 60,
  Strained: 80,
}

/**
 * Compute the decayed strain contribution from a single dose.
 * Uses exponential decay: strain halves every HALF_LIFE_MS.
 */
function decayedStrain(dose: WorkoutMuscleDose, now: number): number {
  return (
    dose.volume *
    dose.multiplier *
    Math.pow(0.5, (now - dose.completedAt) / HALF_LIFE_MS)
  )
}

/**
 * Map a normalized percentage (0–100) to a StrainLevel.
 * Returns Rested for values below the Light threshold.
 */
function strainToLevel(pct: number): StrainLevel {
  if (pct >= THRESHOLDS.Strained) return StrainLevel.Strained
  if (pct >= THRESHOLDS.Heavy) return StrainLevel.Heavy
  if (pct >= THRESHOLDS.Moderate) return StrainLevel.Moderate
  if (pct >= THRESHOLDS.Light) return StrainLevel.Light
  return StrainLevel.Rested
}

/**
 * Compute per-muscle strain levels from a workout dose history.
 *
 * Algorithm:
 * 1. For each dose, compute exponentially decayed strain contribution.
 * 2. Accumulate per muscleSlug.
 * 3. Normalize: pct = min(100, (rawSum / NORMALIZE_DIVISOR) * 100).
 * 4. Map to StrainLevel using threshold boundaries.
 * 5. Only include muscles above the Rested threshold in the result.
 *
 * @param doses - Array of muscle doses from workout history
 * @param now - Current timestamp in Unix ms (injectable for testability)
 * @returns Map of MuscleSlug to StrainLevel — Rested muscles are absent from the map
 */
export function computeStrainMap(
  doses: WorkoutMuscleDose[],
  now: number,
): Map<MuscleSlug, StrainLevel> {
  // Step 1 & 2: Accumulate decayed strain per muscle
  const rawMap = new Map<MuscleSlug, number>()
  for (const dose of doses) {
    const decayed = decayedStrain(dose, now)
    rawMap.set(dose.muscleSlug, (rawMap.get(dose.muscleSlug) ?? 0) + decayed)
  }

  // Step 3–5: Normalize, threshold, and filter Rested
  const result = new Map<MuscleSlug, StrainLevel>()
  for (const [slug, raw] of rawMap) {
    const pct = Math.min(100, (raw / NORMALIZE_DIVISOR) * 100)
    const level = strainToLevel(pct)
    if (level !== StrainLevel.Rested) {
      result.set(slug, level)
    }
  }

  return result
}

/**
 * Hex/oklch color for each StrainLevel, used by the heatmap overlay.
 * Rested uses a near-black oklch token to blend with the SVG background.
 */
export const STRAIN_COLORS: Record<StrainLevel, string> = {
  [StrainLevel.Rested]: 'oklch(0.22 0.02 265)',
  [StrainLevel.Light]: '#3b82f6',
  [StrainLevel.Moderate]: '#eab308',
  [StrainLevel.Heavy]: '#f97316',
  [StrainLevel.Strained]: '#ef4444',
}
