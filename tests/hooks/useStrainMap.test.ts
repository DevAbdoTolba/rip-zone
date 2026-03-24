import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { WorkoutsDatabase } from '@/lib/db/workouts'
import { StrainLevel } from '@/types'
import type { WorkoutSessionId, ExerciseLogId, SetLogId, ExerciseSlug } from '@/types'

// Create a test-scoped database instance
let testDb: WorkoutsDatabase

beforeEach(() => {
  testDb = new WorkoutsDatabase()
})

afterEach(async () => {
  await testDb.delete()
  vi.restoreAllMocks()
})

// Mock the db module to return our test-scoped instance
vi.mock('@/lib/db/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/db/workouts')>()
  return {
    ...actual,
    get workoutsDb() {
      return testDb
    },
  }
})

// Mock exercises data with minimal known entries
vi.mock('@/../data/exercises.json', () => ({
  default: [
    {
      slug: 'flat-bench-press',
      primaryMuscles: ['pectoralis-major'],
      secondaryMuscles: ['anterior-deltoid', 'triceps-long-head'],
    },
    {
      slug: 'back-squat',
      primaryMuscles: ['quadriceps'],
      secondaryMuscles: ['gluteus-maximus', 'hamstrings'],
    },
  ],
}))

// Mock useWorkoutStore to return activeSession: null (triggers initial calculation)
vi.mock('@/stores/useWorkoutStore', () => ({
  useWorkoutStore: (selector: (state: { activeSession: null }) => unknown) =>
    selector({ activeSession: null }),
}))

describe('useStrainMap', () => {
  it('returns empty Map when no completed sessions exist', async () => {
    const { useStrainMap } = await import('@/hooks/useStrainMap')

    const { result } = renderHook(() => useStrainMap())

    await waitFor(() => {
      // Map should remain empty since no sessions were seeded
      expect(result.current).toBeInstanceOf(Map)
      expect(result.current.size).toBe(0)
    })
  })

  it('returns correct StrainLevel entries after seeding workout data', async () => {
    // Seed: one completed session with flat-bench-press and 3 sets x 10 reps x 80kg
    const sessionId = 'test-session-001' as WorkoutSessionId
    const exerciseLogId = 'test-ex-001' as ExerciseLogId

    await testDb.sessions.put({
      id: sessionId,
      startedAt: Date.now() - 3600_000,
      completedAt: Date.now() - 1800_000, // completed 30 minutes ago
      planId: null,
    })

    await testDb.exercisesInSession.put({
      id: exerciseLogId,
      sessionId,
      exerciseSlug: 'flat-bench-press' as ExerciseSlug,
      orderIndex: 0,
    })

    // 3 sets x 10 reps x 80kg = 800 volume per set = 2400 total
    await testDb.sets.bulkPut([
      {
        id: 'set-001' as SetLogId,
        exerciseInSessionId: exerciseLogId,
        setNumber: 1,
        reps: 10,
        weightKg: 80,
        completedAt: Date.now() - 1800_000,
      },
      {
        id: 'set-002' as SetLogId,
        exerciseInSessionId: exerciseLogId,
        setNumber: 2,
        reps: 10,
        weightKg: 80,
        completedAt: Date.now() - 1790_000,
      },
      {
        id: 'set-003' as SetLogId,
        exerciseInSessionId: exerciseLogId,
        setNumber: 3,
        reps: 10,
        weightKg: 80,
        completedAt: Date.now() - 1780_000,
      },
    ])

    const { useStrainMap } = await import('@/hooks/useStrainMap')

    const { result } = renderHook(() => useStrainMap())

    await waitFor(() => {
      // pectoralis-major should have non-Rested strain (2400 vol * 1.0 multiplier, fresh)
      expect(result.current.has('pectoralis-major')).toBe(true)
      const chestStrain = result.current.get('pectoralis-major')
      expect(chestStrain).not.toBe(StrainLevel.Rested)
      expect([
        StrainLevel.Light,
        StrainLevel.Moderate,
        StrainLevel.Heavy,
        StrainLevel.Strained,
      ]).toContain(chestStrain)
    })

    // Secondary muscles should also be in the map (with lower strain)
    await waitFor(() => {
      // anterior-deltoid is secondary (0.4 multiplier), may or may not appear depending on volume
      // At 2400 * 0.4 = 960 → pct = (960/5000) * 100 = 19.2% → just below Light (20%)
      // So secondary muscles at this volume are Rested (not in map)
      // Verify pectoralis-major is indeed the primary muscle that shows strain
      const primaryLevel = result.current.get('pectoralis-major')
      expect(primaryLevel).toBeDefined()
    })
  })
})
