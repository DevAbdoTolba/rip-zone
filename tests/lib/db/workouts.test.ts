import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { WorkoutsDatabase } from '@/lib/db/workouts'
import 'fake-indexeddb/auto'

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
})
