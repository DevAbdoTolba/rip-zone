'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { computeStrainMap } from '@/lib/strain-engine'
import type { WorkoutMuscleDose } from '@/lib/strain-engine'
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'

/**
 * React hook that reads Dexie workout history, computes per-muscle strain levels,
 * and returns a stable Map. Recalculates on mount and when the active session changes
 * (session end triggers a recalculation because activeSession goes from ID → null).
 *
 * Follows D-18: uses dynamic await import() for Dexie to prevent SSR failures.
 */
export function useStrainMap(): Map<MuscleSlug, StrainLevel> {
  const [strainMap, setStrainMap] = useState<Map<MuscleSlug, StrainLevel>>(new Map())

  // Subscribe to primitive ID, not full object — avoids re-fire on unrelated store updates (Pitfall 3)
  const activeSessionId = useWorkoutStore(s => s.activeSession?.id ?? null)

  // Subscribe to bodyweight for normalized strain (BIO-02)
  const bodyweightKg = useProfileStore(s => s.latestBio?.weightKg ?? null)

  // Load bio data on mount to populate bodyweightKg
  useEffect(() => {
    useProfileStore.getState().loadLatestBio()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function recalculate() {
      try {
        // Dynamic import to prevent SSR failures (D-18)
        const { workoutsDb } = await import('@/lib/db/workouts')

        // Dynamic import exercises data
        const exercisesData = (await import('@/../data/exercises.json')).default as Array<{
          slug: string
          primaryMuscles: string[]
          secondaryMuscles: string[]
        }>

        const exerciseMap = new Map(exercisesData.map(e => [e.slug, e]))

        // Load all completed sessions
        const sessions = await workoutsDb.sessions
          .filter(s => s.completedAt !== null)
          .toArray()

        const doses: WorkoutMuscleDose[] = []

        for (const session of sessions) {
          const exercises = await workoutsDb.exercisesInSession
            .where('sessionId')
            .equals(session.id)
            .toArray()

          for (const ex of exercises) {
            const sets = await workoutsDb.sets
              .where('exerciseInSessionId')
              .equals(ex.id)
              .toArray()

            const volume = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0)

            // Skip exercises with no volume (no sets logged)
            if (volume === 0) continue

            const def = exerciseMap.get(ex.exerciseSlug)

            // Skip exercises not found in the exercise definition data
            if (!def) continue

            // Push primary muscle doses (multiplier: 1.0)
            for (const slug of def.primaryMuscles) {
              doses.push({
                muscleSlug: slug as MuscleSlug,
                volume,
                multiplier: 1.0,
                completedAt: session.completedAt!,
              })
            }

            // Push secondary muscle doses (multiplier: 0.4)
            for (const slug of def.secondaryMuscles) {
              doses.push({
                muscleSlug: slug as MuscleSlug,
                volume,
                multiplier: 0.4,
                completedAt: session.completedAt!,
              })
            }
          }
        }

        if (!cancelled) {
          setStrainMap(computeStrainMap(doses, Date.now(), bodyweightKg))
        }
      } catch (err) {
        console.error('useStrainMap: failed to compute', err)
      }
    }

    recalculate()

    return () => {
      cancelled = true
    }
  }, [activeSessionId, bodyweightKg])

  return strainMap
}
