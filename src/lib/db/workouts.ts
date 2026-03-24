import Dexie, { type EntityTable } from 'dexie'
import type { WorkoutSessionId, ExerciseLogId, SetLogId, ExerciseSlug, WorkoutPlanId } from '@/types'
import type { TierRank } from '@/types/ranking'

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

export interface PlanProgressRecord {
  id: string  // `${planId}-${dayLabel}`
  planId: WorkoutPlanId
  dayLabel: string
  completedAt: number
  sessionId: WorkoutSessionId
}

export interface LastUsedRestRecord {
  exerciseSlug: ExerciseSlug
  restSeconds: number
  updatedAt: number
}

export interface LastSeenTierRecord {
  id: 'singleton'
  tier: TierRank
}

export class WorkoutsDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSessionRecord, 'id'>
  exercisesInSession!: EntityTable<ExerciseInSessionRecord, 'id'>
  sets!: EntityTable<SetLogRecord, 'id'>
  planProgress!: EntityTable<PlanProgressRecord, 'id'>
  lastUsedRest!: EntityTable<LastUsedRestRecord, 'exerciseSlug'>
  lastSeenTier!: EntityTable<LastSeenTierRecord, 'id'>

  constructor() {
    super('rip-zone-workouts')

    // Per D-13: Migration pattern for Dexie schema changes.
    // Each version() call preserves user data through schema updates.
    // When adding a new field or index in future phases, add a new version block.
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

    // v2: Add planProgress and lastUsedRest tables for workout plan tracking and rest timer memory.
    // No upgrade() needed — new tables start empty.
    this.version(2).stores({
      sessions: 'id, startedAt, completedAt, planId',
      exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
      sets: 'id, exerciseInSessionId, completedAt',
      planProgress: 'id, planId, dayLabel, completedAt',
      lastUsedRest: 'exerciseSlug',
    })

    // v3: Add lastSeenTier table for tier-up celebration tracking.
    // Stores a singleton record with the last tier the user saw the celebration for.
    // No upgrade() needed — new table starts empty.
    this.version(3).stores({
      sessions: 'id, startedAt, completedAt, planId',
      exercisesInSession: 'id, sessionId, exerciseSlug, orderIndex',
      sets: 'id, exerciseInSessionId, completedAt',
      planProgress: 'id, planId, dayLabel, completedAt',
      lastUsedRest: 'exerciseSlug',
      lastSeenTier: 'id',
    })
  }
}

export const workoutsDb = new WorkoutsDatabase()
