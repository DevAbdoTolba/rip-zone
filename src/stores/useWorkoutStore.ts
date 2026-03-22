import { create } from 'zustand'
import type { WorkoutSessionRecord } from '@/lib/db/workouts'

interface WorkoutState {
  activeSession: WorkoutSessionRecord | null
  setActiveSession: (session: WorkoutSessionRecord | null) => void
  // Per D-19: Manual sync — explicit read/write functions, no auto-persist middleware
  loadActiveSession: () => Promise<void>
  saveActiveSession: (session: WorkoutSessionRecord) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  loadActiveSession: async () => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    const latest = await workoutsDb.sessions
      .orderBy('startedAt')
      .last()
    set({ activeSession: latest ?? null })
  },
  saveActiveSession: async (session) => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    await workoutsDb.sessions.put(session)
    set({ activeSession: session })
  },
}))
