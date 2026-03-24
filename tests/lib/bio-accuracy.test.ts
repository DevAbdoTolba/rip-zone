import { describe, it, expect } from 'vitest'
import { computeAccuracyPct } from '@/lib/bio-accuracy'
import type { BioMetricRecord } from '@/lib/db/profile'

const makeRecord = (overrides: Partial<BioMetricRecord> = {}): BioMetricRecord => ({
  id: 'test-1' as any,
  recordedAt: Date.now(),
  heightCm: null,
  weightKg: null,
  ageYears: null,
  gender: null,
  bodyFatPct: null,
  measurementsCm: null,
  ...overrides,
})

describe('computeAccuracyPct', () => {
  it('returns 0 for null bio', () => {
    expect(computeAccuracyPct(null)).toBe(0)
  })

  it('returns 0 when all fields are null', () => {
    expect(computeAccuracyPct(makeRecord())).toBe(0)
  })

  it('returns 17 for 1 of 6 fields filled', () => {
    expect(computeAccuracyPct(makeRecord({ heightCm: 175 }))).toBe(17)
  })

  it('returns 50 for 3 of 6 fields filled', () => {
    expect(computeAccuracyPct(makeRecord({
      heightCm: 175,
      weightKg: 80,
      ageYears: 25,
    }))).toBe(50)
  })

  it('returns 100 for all 6 fields filled', () => {
    expect(computeAccuracyPct(makeRecord({
      heightCm: 175,
      weightKg: 80,
      ageYears: 25,
      gender: 'male',
      bodyFatPct: 15,
      measurementsCm: 85,
    }))).toBe(100)
  })
})
