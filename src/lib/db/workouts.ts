import Dexie, { type EntityTable } from 'dexie'
import type { WorkoutSessionId, ExerciseLogId, SetLogId, ExerciseSlug, WorkoutPlanId } from '@/types'

// Per D-10: Separate tables for sessions, exercises-in-session, and individual sets
// Per D-11: No computed values stored — strain, PRs, rankings computed at read time

export interface WorkoutSessionRecord {
  id: WorkoutSessionId
  startedAt: number
  completedAt: number | null
  planId: WorkoutPlanId | null
}

export interface ExerciseInSessionRecord {
  id: ExerciseLogId
  sessionId: WorkoutSessionId
  exerciseSlug: ExerciseSlug
  orderIndex: number
}

export interface SetLogRecord {
  id: SetLogId
  exerciseInSessionId: ExerciseLogId
  setNumber: number
  reps: number
  weightKg: number
  completedAt: number
}

export class WorkoutsDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSessionRecord, 'id'>
  exercisesInSession!: EntityTable<ExerciseInSessionRecord, 'id'>
  sets!: EntityTable<SetLogRecord, 'id'>

  constructor() {
    super('rip-zone-workouts')

    // Per D-13: Migration pattern for Dexie schema changes.
    // Each version() call preserves user data through schema updates.
    // When adding a new field or index in future phases, add a new version block:
    //
    //   this.version(2).stores({
    //     sessions: 'id, startedAt, completedAt, planId, newIndex',
    //     exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
    //     sets: 'id, exerciseInSessionId, completedAt',
    //   }).upgrade(tx => {
    //     // Migrate existing records — e.g., backfill a new required field:
    //     return tx.table('sessions').toCollection().modify(session => {
    //       if (session.newField === undefined) {
    //         session.newField = 'default-value'
    //       }
    //     })
    //   })
    //
    // Rules:
    // 1. NEVER modify a previous version() block — only append new ones
    // 2. The stores() definition in the latest version is the active schema
    // 3. The upgrade() callback runs once per user when they open the newer version
    // 4. Always handle undefined fields defensively in upgrade()

    this.version(1).stores({
      sessions: 'id, startedAt, completedAt, planId',
      exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
      sets: 'id, exerciseInSessionId, completedAt',
    })
  }
}

export const workoutsDb = new WorkoutsDatabase()
