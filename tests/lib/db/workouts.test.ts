import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { WorkoutsDatabase } from '@/lib/db/workouts'
import 'fake-indexeddb/auto'
import type { WorkoutSessionId, WorkoutPlanId, ExerciseSlug } from '@/types'

describe('WorkoutsDatabase', () => {
  let db: WorkoutsDatabase

  beforeEach(() => {
    db = new WorkoutsDatabase()
  })

  afterEach(async () => {
    await db.delete()
  })

  test('database name is rip-zone-workouts', () => {
    expect(db.name).toBe('rip-zone-workouts')
  })

  test('has sessions table', () => {
    expect(db.sessions).toBeDefined()
  })

  test('has exercisesInSession table', () => {
    expect(db.exercisesInSession).toBeDefined()
  })

  test('has sets table', () => {
    expect(db.sets).toBeDefined()
  })

  test('sessions table accepts a valid record', async () => {
    await db.open()
    const id = 'test-session-1' as any
    await db.sessions.put({
      id,
      startedAt: Date.now(),
      completedAt: null,
      planId: null,
    })
    const result = await db.sessions.get(id)
    expect(result).toBeDefined()
    expect(result!.id).toBe(id)
  })

  test('exercisesInSession table accepts a valid record', async () => {
    await db.open()
    const id = 'test-eis-1' as any
    await db.exercisesInSession.put({
      id,
      sessionId: 'session-1' as any,
      exerciseSlug: 'bench-press' as any,
      orderIndex: 0,
    })
    const result = await db.exercisesInSession.get(id)
    expect(result).toBeDefined()
    expect(result!.sessionId).toBe('session-1')
  })

  test('sets table accepts a valid record', async () => {
    await db.open()
    const id = 'test-set-1' as any
    await db.sets.put({
      id,
      exerciseInSessionId: 'eis-1' as any,
      setNumber: 1,
      reps: 10,
      weightKg: 60,
      completedAt: Date.now(),
    })
    const result = await db.sets.get(id)
    expect(result).toBeDefined()
    expect(result!.reps).toBe(10)
    expect(result!.weightKg).toBe(60)
  })

  // v2 table tests
  test('has planProgress table', () => {
    expect(db.planProgress).toBeDefined()
  })

  test('has lastUsedRest table', () => {
    expect(db.lastUsedRest).toBeDefined()
  })

  test('planProgress table accepts a valid record', async () => {
    await db.open()
    const planId = 'plan-1' as WorkoutPlanId
    const sessionId = 'session-1' as WorkoutSessionId
    const record = {
      id: `${planId}-day-1`,
      planId,
      dayLabel: 'day-1',
      completedAt: Date.now(),
      sessionId,
    }
    await db.planProgress.put(record)
    const result = await db.planProgress.get(`${planId}-day-1`)
    expect(result).toBeDefined()
    expect(result!.planId).toBe(planId)
    expect(result!.dayLabel).toBe('day-1')
    expect(result!.sessionId).toBe(sessionId)
  })

  test('lastUsedRest table accepts a valid record', async () => {
    await db.open()
    const exerciseSlug = 'bench-press' as ExerciseSlug
    const record = {
      exerciseSlug,
      restSeconds: 90,
      updatedAt: Date.now(),
    }
    await db.lastUsedRest.put(record)
    const result = await db.lastUsedRest.get(exerciseSlug)
    expect(result).toBeDefined()
    expect(result!.restSeconds).toBe(90)
  })

  test('existing v1 tables still work after v2 migration', async () => {
    await db.open()
    // sessions
    await db.sessions.put({ id: 'legacy-session' as WorkoutSessionId, startedAt: 1000, completedAt: null, planId: null })
    const s = await db.sessions.get('legacy-session' as WorkoutSessionId)
    expect(s).toBeDefined()
    // sets
    await db.sets.put({ id: 'legacy-set' as any, exerciseInSessionId: 'e1' as any, setNumber: 1, reps: 5, weightKg: 50, completedAt: 1000 })
    const set = await db.sets.get('legacy-set' as any)
    expect(set).toBeDefined()
  })
})
