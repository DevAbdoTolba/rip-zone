import { create } from 'zustand'
import type { WorkoutSessionRecord, ExerciseInSessionRecord, SetLogRecord } from '@/lib/db/workouts'
import type { ExerciseLogId, ExerciseSlug, SetLogId, WorkoutPlanId, WorkoutSessionId } from '@/types'

// Per D-18: Zustand stores use dynamic await import() for Dexie to prevent SSR failures in Next.js App Router
// Per D-19: Manual sync — explicit read/write functions, no auto-persist middleware

interface ActiveExerciseState {
  exerciseLogId: ExerciseLogId
  exerciseSlug: ExerciseSlug
  sets: SetLogRecord[]
  pendingSet: { reps: number; weightKg: number }
}

interface TimerState {
  running: boolean
  remaining: number
  total: number
  exerciseSlug: ExerciseSlug | null
}

interface WorkoutState {
  activeSession: WorkoutSessionRecord | null
  activeExercises: ActiveExerciseState[]
  currentPlanId: WorkoutPlanId | null
  currentDayLabel: string | null
  timer: TimerState
  elapsedSeconds: number
  // Actions
  startSession: (planId?: WorkoutPlanId, dayLabel?: string) => Promise<void>
  finishSession: () => Promise<void>
  addExercise: (slug: ExerciseSlug, suggestedReps?: number, suggestedWeightKg?: number, restSeconds?: number) => Promise<void>
  removeExercise: (exerciseLogId: ExerciseLogId) => Promise<void>
  confirmSet: (exerciseLogId: ExerciseLogId, reps: number, weightKg: number) => Promise<void>
  updatePendingSet: (exerciseLogId: ExerciseLogId, reps: number, weightKg: number) => void
  startTimer: (seconds: number, exerciseSlug: ExerciseSlug) => void
  pauseTimer: () => void
  resumeTimer: () => void
  adjustTimer: (delta: number) => void
  dismissTimer: () => void
  tickTimer: () => void
  tickElapsed: () => void
  loadActiveSession: () => Promise<void>
}

const INITIAL_TIMER: TimerState = {
  running: false,
  remaining: 0,
  total: 0,
  exerciseSlug: null,
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  activeExercises: [],
  currentPlanId: null,
  currentDayLabel: null,
  timer: INITIAL_TIMER,
  elapsedSeconds: 0,

  startSession: async (planId?: WorkoutPlanId, dayLabel?: string) => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    const session: WorkoutSessionRecord = {
      id: crypto.randomUUID() as WorkoutSessionId,
      startedAt: Date.now(),
      completedAt: null,
      planId: planId ?? null,
    }
    await workoutsDb.sessions.put(session)
    set({
      activeSession: session,
      activeExercises: [],
      currentPlanId: planId ?? null,
      currentDayLabel: dayLabel ?? null,
      elapsedSeconds: 0,
    })
  },

  finishSession: async () => {
    const { activeSession } = get()
    if (!activeSession) return
    const { workoutsDb } = await import('@/lib/db/workouts')
    const updated: WorkoutSessionRecord = { ...activeSession, completedAt: Date.now() }
    await workoutsDb.sessions.put(updated)
    set({ activeSession: null, activeExercises: [] })
  },

  addExercise: async (slug: ExerciseSlug, suggestedReps?: number, suggestedWeightKg?: number, restSeconds?: number) => {
    const { activeSession, activeExercises } = get()
    if (!activeSession) return
    const { workoutsDb } = await import('@/lib/db/workouts')
    const exerciseLogId = crypto.randomUUID() as ExerciseLogId
    const record: ExerciseInSessionRecord = {
      id: exerciseLogId,
      sessionId: activeSession.id,
      exerciseSlug: slug,
      orderIndex: activeExercises.length,
    }
    await workoutsDb.exercisesInSession.put(record)
    // Per D-03: Pre-fill rest if provided
    if (restSeconds !== undefined) {
      await workoutsDb.lastUsedRest.put({ exerciseSlug: slug, restSeconds, updatedAt: Date.now() })
    }
    const newExercise: ActiveExerciseState = {
      exerciseLogId,
      exerciseSlug: slug,
      sets: [],
      pendingSet: {
        reps: suggestedReps ?? 10,
        weightKg: suggestedWeightKg ?? 20,
      },
    }
    set({ activeExercises: [...activeExercises, newExercise] })
  },

  removeExercise: async (exerciseLogId: ExerciseLogId) => {
    const { activeExercises } = get()
    const { workoutsDb } = await import('@/lib/db/workouts')
    await workoutsDb.exercisesInSession.delete(exerciseLogId)
    set({ activeExercises: activeExercises.filter(e => e.exerciseLogId !== exerciseLogId) })
  },

  confirmSet: async (exerciseLogId: ExerciseLogId, reps: number, weightKg: number) => {
    const { activeExercises } = get()
    const exerciseState = activeExercises.find(e => e.exerciseLogId === exerciseLogId)
    if (!exerciseState) return
    const { workoutsDb } = await import('@/lib/db/workouts')
    const setRecord: SetLogRecord = {
      id: crypto.randomUUID() as SetLogId,
      exerciseInSessionId: exerciseLogId,
      setNumber: exerciseState.sets.length + 1,
      reps,
      weightKg,
      completedAt: Date.now(),
    }
    await workoutsDb.sets.put(setRecord)
    // Per D-03: Pre-fill next set with same reps/weightKg
    const updatedExercises = activeExercises.map(e =>
      e.exerciseLogId === exerciseLogId
        ? { ...e, sets: [...e.sets, setRecord], pendingSet: { reps, weightKg } }
        : e
    )
    set({ activeExercises: updatedExercises })
  },

  updatePendingSet: (exerciseLogId: ExerciseLogId, reps: number, weightKg: number) => {
    const { activeExercises } = get()
    const updatedExercises = activeExercises.map(e =>
      e.exerciseLogId === exerciseLogId
        ? { ...e, pendingSet: { reps, weightKg } }
        : e
    )
    set({ activeExercises: updatedExercises })
  },

  startTimer: (seconds: number, exerciseSlug: ExerciseSlug) => {
    set({
      timer: {
        running: true,
        remaining: seconds,
        total: seconds,
        exerciseSlug,
      },
    })
  },

  pauseTimer: () => {
    set(state => ({ timer: { ...state.timer, running: false } }))
  },

  resumeTimer: () => {
    set(state => ({ timer: { ...state.timer, running: true } }))
  },

  adjustTimer: (delta: number) => {
    set(state => ({
      timer: {
        ...state.timer,
        remaining: Math.max(0, state.timer.remaining + delta),
      },
    }))
  },

  dismissTimer: () => {
    set({ timer: { ...INITIAL_TIMER } })
  },

  tickTimer: () => {
    set(state => ({
      timer: {
        ...state.timer,
        remaining: Math.max(0, state.timer.remaining - 1),
      },
    }))
  },

  tickElapsed: () => {
    set(state => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
  },

  loadActiveSession: async () => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    // Find the latest session where completedAt === null
    const sessions = await workoutsDb.sessions
      .filter(s => s.completedAt === null)
      .sortBy('startedAt')
    const session = sessions[sessions.length - 1] ?? null
    if (!session) {
      set({ activeSession: null, activeExercises: [] })
      return
    }
    // Load exercises and their sets
    const exerciseRecords = await workoutsDb.exercisesInSession
      .where('sessionId')
      .equals(session.id)
      .sortBy('orderIndex')
    const activeExercises: ActiveExerciseState[] = await Promise.all(
      exerciseRecords.map(async (e) => {
        const sets = await workoutsDb.sets
          .where('exerciseInSessionId')
          .equals(e.id)
          .sortBy('setNumber')
        const lastSet = sets[sets.length - 1]
        return {
          exerciseLogId: e.id,
          exerciseSlug: e.exerciseSlug,
          sets,
          pendingSet: lastSet
            ? { reps: lastSet.reps, weightKg: lastSet.weightKg }
            : { reps: 10, weightKg: 20 },
        }
      })
    )
    set({ activeSession: session, activeExercises })
  },
}))
