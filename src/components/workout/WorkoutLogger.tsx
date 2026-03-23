'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Dumbbell, CheckCircle2 } from 'lucide-react'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { computePRs, isNewPR } from '@/lib/pr-detection'
import type { Exercise } from '@/types/workout'
import type { ExerciseLogId } from '@/types'
import type { SetLogRecord } from '@/lib/db/workouts'
import { ExercisePickerSheet } from './ExercisePickerSheet'
import { SetRow } from './SetRow'
import { RestTimerWidget } from './RestTimerWidget'

interface WorkoutLoggerProps {
  exercises: Exercise[]
}

// Format seconds as mm:ss
function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Load historical sets for an exercise from Dexie
async function loadHistoricalSets(exerciseSlug: string): Promise<Pick<SetLogRecord, 'reps' | 'weightKg'>[]> {
  try {
    const { workoutsDb } = await import('@/lib/db/workouts')
    // Get all sessions for this exercise to compute PRs
    const exerciseRecords = await workoutsDb.exercisesInSession
      .where('exerciseSlug')
      .equals(exerciseSlug)
      .toArray()
    const allSets: Pick<SetLogRecord, 'reps' | 'weightKg'>[] = []
    for (const record of exerciseRecords) {
      const sets = await workoutsDb.sets
        .where('exerciseInSessionId')
        .equals(record.id)
        .toArray()
      allSets.push(...sets.map(s => ({ reps: s.reps, weightKg: s.weightKg })))
    }
    return allSets
  } catch {
    return []
  }
}

export function WorkoutLogger({ exercises }: WorkoutLoggerProps) {
  const {
    activeSession,
    activeExercises,
    elapsedSeconds,
    startSession,
    finishSession,
    addExercise,
    confirmSet,
    tickElapsed,
  } = useWorkoutStore()

  const [pickerOpen, setPickerOpen] = useState(false)
  // Maps exerciseSlug -> historical PRMap for checking new PRs
  const [historicPRs, setHistoricPRs] = useState<Map<string, Map<number, number>>>(new Map())

  // Elapsed timer
  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => {
      tickElapsed()
    }, 1000)
    return () => clearInterval(interval)
  }, [activeSession, tickElapsed])

  // Load active session on mount (crash recovery)
  useEffect(() => {
    const { loadActiveSession } = useWorkoutStore.getState()
    loadActiveSession()
  }, [])

  // Load historical PRs whenever exercises change
  useEffect(() => {
    const loadPRs = async () => {
      const updates = new Map<string, Map<number, number>>()
      for (const ex of activeExercises) {
        const historicalSets = await loadHistoricalSets(ex.exerciseSlug as string)
        updates.set(ex.exerciseSlug as string, computePRs(historicalSets))
      }
      setHistoricPRs(updates)
    }
    loadPRs()
  }, [activeExercises])

  const handleSelectExercise = useCallback(async (exercise: Exercise) => {
    const DEFAULT_REST = 90
    await addExercise(exercise.slug, 10, 20, DEFAULT_REST)
    const { startTimer } = useWorkoutStore.getState()
    startTimer(DEFAULT_REST, exercise.slug)
  }, [addExercise])

  const handleConfirmSet = useCallback(async (
    exerciseLogId: ExerciseLogId,
    reps: number,
    weightKg: number,
    exerciseSlug: string,
  ) => {
    await confirmSet(exerciseLogId, reps, weightKg)
    // Start rest timer after confirming a set
    const { timer, startTimer } = useWorkoutStore.getState()
    if (!timer.running) {
      startTimer(90, exerciseSlug as any)
    }
  }, [confirmSet])

  // Get exercise name from slug
  const getExerciseName = (slug: string) => {
    return exercises.find(e => (e.slug as string) === slug)?.name ?? slug
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center">
          <Dumbbell size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-[20px] font-bold text-foreground mb-2">Ready to train?</h2>
          <p className="text-[14px] text-muted-foreground">Start a freestyle workout session</p>
        </div>
        <button
          onClick={() => startSession()}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-[16px] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Start Workout
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Elapsed timer header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Elapsed</p>
          <p className="text-[28px] font-mono font-bold text-foreground tabular-nums">
            {formatElapsed(elapsedSeconds)}
          </p>
        </div>
        <button
          onClick={() => finishSession()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-[14px] font-medium hover:bg-destructive/20 transition-colors"
        >
          <CheckCircle2 size={16} />
          Finish
        </button>
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-3 px-4">
        {activeExercises.map(exerciseState => {
          const prMap = historicPRs.get(exerciseState.exerciseSlug as string)

          return (
            <div
              key={exerciseState.exerciseLogId as string}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <h3 className="text-[16px] font-semibold text-foreground mb-3">
                {getExerciseName(exerciseState.exerciseSlug as string)}
              </h3>

              <div className="flex flex-col gap-1.5">
                {/* Confirmed sets */}
                {exerciseState.sets.map(set => {
                  const isPR = prMap ? isNewPR({ reps: set.reps, weightKg: set.weightKg }, prMap) : false
                  return (
                    <SetRow
                      key={set.id as string}
                      setNumber={set.setNumber}
                      defaultReps={set.reps}
                      defaultWeightKg={set.weightKg}
                      isPR={isPR}
                      confirmed={true}
                      onConfirm={() => {}}
                    />
                  )
                })}

                {/* Pending set */}
                <SetRow
                  setNumber={exerciseState.sets.length + 1}
                  defaultReps={exerciseState.pendingSet.reps}
                  defaultWeightKg={exerciseState.pendingSet.weightKg}
                  isPR={false}
                  confirmed={false}
                  onConfirm={(reps, weightKg) =>
                    handleConfirmSet(
                      exerciseState.exerciseLogId,
                      reps,
                      weightKg,
                      exerciseState.exerciseSlug as string,
                    )
                  }
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Add exercise button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/40 text-primary text-[14px] font-medium hover:bg-primary/5 transition-colors"
        >
          <Plus size={16} />
          Add Exercise
        </button>
      </div>

      {/* Exercise picker bottom sheet */}
      <ExercisePickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exercises={exercises}
        onSelectExercise={handleSelectExercise}
      />

      {/* Rest timer widget (positions itself via fixed) */}
      <RestTimerWidget />
    </div>
  )
}
