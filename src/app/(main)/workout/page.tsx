'use client'

import { useEffect, useState } from 'react'
import exercisesData from '@/../data/exercises.json'
import plansData from '@/../data/workout-plans.json'
import { WorkoutLogger } from '@/components/workout/WorkoutLogger'
import { PlanBrowser } from '@/components/plans/PlanBrowser'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { inferUserLevel } from '@/lib/plan-recommendation'
import type { Exercise, WorkoutPlan, WorkoutPlanExercise, WorkoutPlanId } from '@/types/workout'
import type { PlanProgressRecord } from '@/lib/db/workouts'

const plans = plansData as unknown as WorkoutPlan[]
const exercises = exercisesData as unknown as Exercise[]

type Tab = 'freestyle' | 'plans'

export default function WorkoutPage() {
  const activeSession = useWorkoutStore(s => s.activeSession)
  const startSession = useWorkoutStore(s => s.startSession)
  const addExercise = useWorkoutStore(s => s.addExercise)

  const [tab, setTab] = useState<Tab>('freestyle')
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [planProgress, setPlanProgress] = useState<PlanProgressRecord[]>([])

  useEffect(() => {
    async function loadData() {
      const { workoutsDb } = await import('@/lib/db/workouts')
      const completedSessions = await workoutsDb.sessions
        .filter(s => s.completedAt !== null)
        .toArray()
      setUserLevel(inferUserLevel(completedSessions))
      const allProgress = await workoutsDb.planProgress.toArray()
      setPlanProgress(allProgress)
    }
    loadData()
  }, [activeSession]) // Refresh when session state changes (after finish)

  async function handleStartPlanDay(
    planId: WorkoutPlanId,
    dayLabel: string,
    exercises: WorkoutPlanExercise[],
  ) {
    await startSession(planId, dayLabel)
    // Pre-load exercises sorted by orderIndex
    const sorted = [...exercises].sort((a, b) => a.orderIndex - b.orderIndex)
    for (const ex of sorted) {
      await addExercise(ex.exerciseSlug, ex.repsMin, 0, ex.restSeconds)
    }
  }

  // When there is an active session, always show the logger
  if (activeSession) {
    return (
      <main className="flex-1 pb-20">
        <WorkoutLogger exercises={exercises} />
      </main>
    )
  }

  return (
    <main className="flex-1 pb-20">
      {/* Freestyle / Plans toggle */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/60 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('freestyle')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'freestyle'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Freestyle
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'plans'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Plans
          </button>
        </div>
      </div>

      <div className="p-4">
        {tab === 'freestyle' ? (
          <div className="flex flex-col items-center justify-center pt-12 gap-4">
            <p className="text-muted-foreground text-sm text-center">
              Log any exercises you want, in any order.
            </p>
            <button
              onClick={() => startSession()}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base active:scale-95 transition-transform"
            >
              Start Freestyle Workout
            </button>
          </div>
        ) : (
          <PlanBrowser
            plans={plans}
            userLevel={userLevel}
            progress={planProgress}
            onStartDay={handleStartPlanDay}
          />
        )}
      </div>
    </main>
  )
}
