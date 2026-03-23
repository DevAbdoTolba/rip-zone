import { describe, test, expect } from 'vitest'
import { computePRs, isNewPR } from '@/lib/pr-detection'

describe('computePRs', () => {
  test('returns empty Map for empty input', () => {
    const result = computePRs([])
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  test('returns best weight per rep count', () => {
    const result = computePRs([
      { reps: 5, weightKg: 60 },
      { reps: 5, weightKg: 80 },
      { reps: 10, weightKg: 50 },
    ])
    expect(result.get(5)).toBe(80)
    expect(result.get(10)).toBe(50)
    expect(result.size).toBe(2)
  })

  test('handles single set', () => {
    const result = computePRs([{ reps: 3, weightKg: 100 }])
    expect(result.get(3)).toBe(100)
  })

  test('tracks multiple different rep counts', () => {
    const result = computePRs([
      { reps: 1, weightKg: 150 },
      { reps: 5, weightKg: 100 },
      { reps: 10, weightKg: 60 },
      { reps: 20, weightKg: 40 },
    ])
    expect(result.size).toBe(4)
    expect(result.get(1)).toBe(150)
    expect(result.get(5)).toBe(100)
    expect(result.get(10)).toBe(60)
    expect(result.get(20)).toBe(40)
  })
})

describe('isNewPR', () => {
  test('returns true when weight exceeds historic best', () => {
    const prMap = new Map([[5, 80]])
    expect(isNewPR({ reps: 5, weightKg: 90 }, prMap)).toBe(true)
  })

  test('returns false when weight is less than historic best', () => {
    const prMap = new Map([[5, 80]])
    expect(isNewPR({ reps: 5, weightKg: 70 }, prMap)).toBe(false)
  })

  test('returns false when weight equals historic best', () => {
    const prMap = new Map([[5, 80]])
    expect(isNewPR({ reps: 5, weightKg: 80 }, prMap)).toBe(false)
  })

  test('returns true for new rep count not in history', () => {
    const prMap = new Map([[5, 80]])
    expect(isNewPR({ reps: 3, weightKg: 50 }, prMap)).toBe(true)
  })

  test('returns true for any set against empty history', () => {
    const prMap = new Map<number, number>()
    expect(isNewPR({ reps: 10, weightKg: 40 }, prMap)).toBe(true)
  })
})
