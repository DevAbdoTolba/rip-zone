import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { ProfileDatabase } from '@/lib/db/profile'
import 'fake-indexeddb/auto'

describe('ProfileDatabase', () => {
  let db: ProfileDatabase

  beforeEach(() => {
    db = new ProfileDatabase()
  })

  afterEach(async () => {
    await db.delete()
  })

  test('database name is rip-zone-profile', () => {
    expect(db.name).toBe('rip-zone-profile')
  })

  test('has bioMetrics table', () => {
    expect(db.bioMetrics).toBeDefined()
  })

  test('has rankState table', () => {
    expect(db.rankState).toBeDefined()
  })

  test('bioMetrics table accepts a valid record', async () => {
    await db.open()
    const id = 'test-bio-1' as any
    await db.bioMetrics.put({
      id,
      recordedAt: Date.now(),
      heightCm: 175,
      weightKg: 80,
      ageYears: 25,
      gender: 'male',
      bodyFatPct: 15,
    })
    const result = await db.bioMetrics.get(id)
    expect(result).toBeDefined()
    expect(result!.heightCm).toBe(175)
    expect(result!.weightKg).toBe(80)
  })

  test('bioMetrics table accepts null optional fields', async () => {
    await db.open()
    const id = 'test-bio-2' as any
    await db.bioMetrics.put({
      id,
      recordedAt: Date.now(),
      heightCm: null,
      weightKg: null,
      ageYears: null,
      gender: null,
      bodyFatPct: null,
    })
    const result = await db.bioMetrics.get(id)
    expect(result).toBeDefined()
    expect(result!.heightCm).toBeNull()
  })

  test('rankState table accepts singleton record', async () => {
    await db.open()
    await db.rankState.put({
      id: 'singleton',
      tier: 'Iron' as any,
      subTierProgress: 0,
      lastUpdatedAt: Date.now(),
    })
    const result = await db.rankState.get('singleton')
    expect(result).toBeDefined()
    expect(result!.tier).toBe('Iron')
    expect(result!.subTierProgress).toBe(0)
  })
})
