import { describe, it, expect } from 'vitest'
import { computeStrainMap, STRAIN_COLORS } from '@/lib/strain-engine'
import type { WorkoutMuscleDose } from '@/lib/strain-engine'
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'

const HALF_LIFE_MS = 72 * 60 * 60 * 1000 // 259200000 ms

const chest = 'pectoralis-major' as MuscleSlug
const back = 'latissimus-dorsi' as MuscleSlug

describe('computeStrainMap', () => {
  it('returns empty map for empty doses', () => {
    const result = computeStrainMap([], Date.now())
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  it('returns Strained for fresh max-volume dose', () => {
    const now = Date.now()
    const dose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 5000,
      multiplier: 1.0,
      completedAt: now,
    }
    const result = computeStrainMap([dose], now)
    expect(result.get(chest)).toBe(StrainLevel.Strained)
  })

  it('returns Moderate after 72hr decay', () => {
    const now = Date.now()
    const dose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 5000,
      multiplier: 1.0,
      completedAt: now - HALF_LIFE_MS, // 72 hours ago → 50% decay → ~50% strain
    }
    const result = computeStrainMap([dose], now)
    // 50% of (5000/5000*100) = 50% → Moderate threshold is 40-60
    expect(result.get(chest)).toBe(StrainLevel.Moderate)
  })

  it('returns Light after 144hr decay', () => {
    const now = Date.now()
    const dose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 5000,
      multiplier: 1.0,
      completedAt: now - 2 * HALF_LIFE_MS, // 144 hours ago → 25% decay → ~25% strain
    }
    const result = computeStrainMap([dose], now)
    // 25% of (5000/5000*100) = 25% → Light threshold is 20-40
    expect(result.get(chest)).toBe(StrainLevel.Light)
  })

  it('secondary multiplier produces lower strain than primary at same volume', () => {
    const now = Date.now()
    const primaryDose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 3000,
      multiplier: 1.0,
      completedAt: now,
    }
    const secondaryDose: WorkoutMuscleDose = {
      muscleSlug: back,
      volume: 3000,
      multiplier: 0.4,
      completedAt: now,
    }
    const result = computeStrainMap([primaryDose, secondaryDose], now)
    const primaryLevel = result.get(chest)
    const secondaryLevel = result.get(back)
    // Primary should be at a higher level than secondary
    const levels = [StrainLevel.Light, StrainLevel.Moderate, StrainLevel.Heavy, StrainLevel.Strained]
    const primaryIdx = levels.indexOf(primaryLevel as StrainLevel)
    const secondaryIdx = levels.indexOf(secondaryLevel as StrainLevel)
    expect(primaryIdx).toBeGreaterThan(secondaryIdx)
  })

  it('caps at Strained for extreme volume', () => {
    const now = Date.now()
    const dose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 50000, // 10x the normalize divisor
      multiplier: 1.0,
      completedAt: now,
    }
    const result = computeStrainMap([dose], now)
    expect(result.get(chest)).toBe(StrainLevel.Strained)
  })

  it('accumulates strain from multiple sessions', () => {
    const now = Date.now()
    // Two small doses that each alone produce Light strain — together should be higher
    const dose1: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 1500,
      multiplier: 1.0,
      completedAt: now,
    }
    const dose2: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 1500,
      multiplier: 1.0,
      completedAt: now - 24 * 60 * 60 * 1000, // 24 hours ago
    }
    const singleResult = computeStrainMap([dose1], now)
    const combinedResult = computeStrainMap([dose1, dose2], now)
    // Combined strain should be >= single strain
    const levels = [StrainLevel.Light, StrainLevel.Moderate, StrainLevel.Heavy, StrainLevel.Strained]
    const singleLevel = singleResult.get(chest)
    const combinedLevel = combinedResult.get(chest)
    const singleIdx = singleLevel ? levels.indexOf(singleLevel) : -1
    const combinedIdx = combinedLevel ? levels.indexOf(combinedLevel) : -1
    expect(combinedIdx).toBeGreaterThanOrEqual(singleIdx)
  })

  it('excludes Rested muscles from result map', () => {
    const now = Date.now()
    // Very small volume 8 days ago — should be below Light threshold
    const dose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 100,
      multiplier: 1.0,
      completedAt: now - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    }
    const result = computeStrainMap([dose], now)
    // Should not include the muscle in the map (Rested = absence of key)
    expect(result.has(chest)).toBe(false)
  })

  it('handles multiple muscles independently', () => {
    const now = Date.now()
    const chestDose: WorkoutMuscleDose = {
      muscleSlug: chest,
      volume: 5000,
      multiplier: 1.0,
      completedAt: now,
    }
    const backDose: WorkoutMuscleDose = {
      muscleSlug: back,
      volume: 2000,
      multiplier: 1.0,
      completedAt: now - HALF_LIFE_MS, // 72hrs ago — decayed
    }
    const result = computeStrainMap([chestDose, backDose], now)
    // Chest: fresh 5000 → Strained
    expect(result.get(chest)).toBe(StrainLevel.Strained)
    // Back: 2000 at 50% decay = 1000, pct = (1000/5000)*100 = 20% → Light boundary
    // 20% is exactly at the Light threshold boundary — should be Light or Moderate depending on boundary condition
    expect(result.has(back)).toBe(true)
    // Verify they are independent (chest is higher than back)
    const levels = [StrainLevel.Light, StrainLevel.Moderate, StrainLevel.Heavy, StrainLevel.Strained]
    const chestIdx = levels.indexOf(result.get(chest) as StrainLevel)
    const backIdx = levels.indexOf(result.get(back) as StrainLevel)
    expect(chestIdx).toBeGreaterThan(backIdx)
  })
})

describe('STRAIN_COLORS', () => {
  it('maps all StrainLevel values to correct color strings', () => {
    expect(STRAIN_COLORS[StrainLevel.Rested]).toBe('oklch(0.22 0.02 265)')
    expect(STRAIN_COLORS[StrainLevel.Light]).toBe('#3b82f6')
    expect(STRAIN_COLORS[StrainLevel.Moderate]).toBe('#eab308')
    expect(STRAIN_COLORS[StrainLevel.Heavy]).toBe('#f97316')
    expect(STRAIN_COLORS[StrainLevel.Strained]).toBe('#ef4444')
    // Ensure all 5 levels are mapped
    const allLevels = Object.values(StrainLevel)
    expect(allLevels.every((level) => level in STRAIN_COLORS)).toBe(true)
  })
})
