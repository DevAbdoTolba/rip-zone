import { describe, it, expect } from 'vitest'
import {
  computeTierRank,
  computeSubTierProgress,
  computeRadarAxes,
  TIER_THRESHOLDS,
  CATEGORY_MAP,
} from '@/lib/ranking'
import { TierRank } from '@/types/ranking'

describe('TIER_THRESHOLDS', () => {
  it('has 7 tiers in ascending order', () => {
    expect(TIER_THRESHOLDS).toHaveLength(7)
    expect(TIER_THRESHOLDS[0].tier).toBe(TierRank.Iron)
    expect(TIER_THRESHOLDS[6].tier).toBe(TierRank.Elite)
  })

  it('has correct minimum volumes', () => {
    const map = Object.fromEntries(TIER_THRESHOLDS.map(t => [t.tier, t.minVolume]))
    expect(map[TierRank.Iron]).toBe(0)
    expect(map[TierRank.Bronze]).toBe(5000)
    expect(map[TierRank.Silver]).toBe(25000)
    expect(map[TierRank.Gold]).toBe(100000)
    expect(map[TierRank.Platinum]).toBe(300000)
    expect(map[TierRank.Diamond]).toBe(750000)
    expect(map[TierRank.Elite]).toBe(1500000)
  })
})

describe('CATEGORY_MAP', () => {
  it('maps chest to push', () => {
    expect(CATEGORY_MAP['chest']).toBe('push')
  })

  it('maps shoulders to push', () => {
    expect(CATEGORY_MAP['shoulders']).toBe('push')
  })

  it('maps triceps to push', () => {
    expect(CATEGORY_MAP['triceps']).toBe('push')
  })

  it('maps back to pull', () => {
    expect(CATEGORY_MAP['back']).toBe('pull')
  })

  it('maps biceps to pull', () => {
    expect(CATEGORY_MAP['biceps']).toBe('pull')
  })

  it('maps quads to legs', () => {
    expect(CATEGORY_MAP['quads']).toBe('legs')
  })

  it('maps hamstrings to legs', () => {
    expect(CATEGORY_MAP['hamstrings']).toBe('legs')
  })

  it('maps glutes to legs', () => {
    expect(CATEGORY_MAP['glutes']).toBe('legs')
  })

  it('maps abs to core', () => {
    expect(CATEGORY_MAP['abs']).toBe('core')
  })

  it('maps obliques to core', () => {
    expect(CATEGORY_MAP['obliques']).toBe('core')
  })
})

describe('computeTierRank', () => {
  it('returns Iron for 0 volume', () => {
    expect(computeTierRank(0)).toBe(TierRank.Iron)
  })

  it('returns Iron for 4999 volume', () => {
    expect(computeTierRank(4999)).toBe(TierRank.Iron)
  })

  it('returns Bronze for 5000 volume', () => {
    expect(computeTierRank(5000)).toBe(TierRank.Bronze)
  })

  it('returns Silver for 25000 volume', () => {
    expect(computeTierRank(25000)).toBe(TierRank.Silver)
  })

  it('returns Gold for 100000 volume', () => {
    expect(computeTierRank(100000)).toBe(TierRank.Gold)
  })

  it('returns Platinum for 300000 volume', () => {
    expect(computeTierRank(300000)).toBe(TierRank.Platinum)
  })

  it('returns Diamond for 750000 volume', () => {
    expect(computeTierRank(750000)).toBe(TierRank.Diamond)
  })

  it('returns Elite for 1500000 volume', () => {
    expect(computeTierRank(1500000)).toBe(TierRank.Elite)
  })

  it('caps at Elite for 2000000 volume', () => {
    expect(computeTierRank(2000000)).toBe(TierRank.Elite)
  })
})

describe('computeSubTierProgress', () => {
  it('returns 0 at Iron floor (volume=0)', () => {
    expect(computeSubTierProgress(0)).toBe(0)
  })

  it('returns 0.5 halfway Iron->Bronze (volume=2500)', () => {
    expect(computeSubTierProgress(2500)).toBe(0.5)
  })

  it('returns 0 just entered Bronze (volume=5000)', () => {
    expect(computeSubTierProgress(5000)).toBe(0)
  })

  it('returns 0.5 halfway Bronze->Silver (volume=15000)', () => {
    expect(computeSubTierProgress(15000)).toBe(0.5)
  })

  it('returns 1 for Elite (no next tier)', () => {
    expect(computeSubTierProgress(1500000)).toBe(1)
  })
})

describe('computeRadarAxes', () => {
  it('returns all zeros for empty volumes', () => {
    const result = computeRadarAxes({}, 5000)
    expect(result).toEqual({ push: 0, pull: 0, legs: 0, core: 0, conditioning: 0 })
  })

  it('normalizes each axis 0-100 relative to tier max volume', () => {
    const result = computeRadarAxes({ push: 5000, pull: 2500, legs: 0, core: 1000, conditioning: 0 }, 5000)
    expect(result.push).toBe(100)
    expect(result.pull).toBe(50)
    expect(result.legs).toBe(0)
    expect(result.core).toBe(20)
    expect(result.conditioning).toBe(0)
  })

  it('caps each axis at 100', () => {
    const result = computeRadarAxes({ push: 10000 }, 5000)
    expect(result.push).toBe(100)
  })

  it('returns zeros when tierMaxVolume is 0 (avoids division by zero)', () => {
    const result = computeRadarAxes({ push: 1000 }, 0)
    expect(result.push).toBe(0)
  })
})
