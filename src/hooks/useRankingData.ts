'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import {
  computeTierRank,
  computeSubTierProgress,
  computeRadarAxes,
  CATEGORY_MAP,
  TIER_THRESHOLDS,
  type RadarAxes,
} from '@/lib/ranking'
import { TierRank } from '@/types/ranking'

export interface WeekSummary {
  sessionCount: number
  totalVolume: number
}

export interface RankingData {
  tier: TierRank
  subTierProgress: number
  radarAxes: RadarAxes
  totalVolume: number
  weekSummary: WeekSummary
  lastSeenTier: TierRank | null
  setLastSeenTier: (tier: TierRank) => Promise<void>
  isLoading: boolean
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Aggregates Dexie workout history into ranking data: tier, sub-tier progress,
 * radar axes, total volume, and 7-day summary.
 *
 * Also manages lastSeenTier for tier-up celebration tracking.
 *
 * Follows D-18: dynamic await import() for Dexie to prevent SSR failures.
 * Follows cancelled-flag pattern from useStrainMap for cleanup safety.
 */
export function useRankingData(): RankingData {
  const [tier, setTier] = useState<TierRank>(TierRank.Iron)
  const [subTierProgress, setSubTierProgress] = useState(0)
  const [radarAxes, setRadarAxes] = useState<RadarAxes>({
    push: 0,
    pull: 0,
    legs: 0,
    core: 0,
    conditioning: 0,
  })
  const [totalVolume, setTotalVolume] = useState(0)
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({ sessionCount: 0, totalVolume: 0 })
  const [lastSeenTier, setLastSeenTierState] = useState<TierRank | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Subscribe to primitive ID to avoid re-fires on unrelated store updates (D-18 pattern)
  const activeSessionId = useWorkoutStore(s => s.activeSession?.id ?? null)

  const setLastSeenTier = async (newTier: TierRank): Promise<void> => {
    const { workoutsDb } = await import('@/lib/db/workouts')
    await workoutsDb.lastSeenTier.put({ id: 'singleton', tier: newTier })
    setLastSeenTierState(newTier)
  }

  useEffect(() => {
    let cancelled = false

    async function recalculate() {
      setIsLoading(true)
      try {
        const { workoutsDb } = await import('@/lib/db/workouts')

        // Load exercise definitions for muscle->category mapping
        const exercisesData = (await import('@/../data/exercises.json')).default as Array<{
          slug: string
          primaryMuscles: string[]
          secondaryMuscles: string[]
        }>
        const exerciseMap = new Map(exercisesData.map(e => [e.slug, e]))

        // Load all sets and build exerciseInSessionId -> exerciseSlug mapping
        const [allSets, allExercisesInSession, allSessions] = await Promise.all([
          workoutsDb.sets.toArray(),
          workoutsDb.exercisesInSession.toArray(),
          workoutsDb.sessions.toArray(),
        ])

        const exerciseSlugMap = new Map(
          allExercisesInSession.map(ex => [ex.id, ex.exerciseSlug])
        )

        const sessionCompletedAtMap = new Map(
          allSessions.map(s => [s.id, s.completedAt])
        )

        // Build exerciseInSessionId -> sessionId mapping for week summary
        const exerciseSessionMap = new Map(
          allExercisesInSession.map(ex => [ex.id, ex.sessionId])
        )

        // Compute total volume and per-category volumes
        const categoryVolumes: Record<string, number> = {
          push: 0,
          pull: 0,
          legs: 0,
          core: 0,
          conditioning: 0,
        }
        let totalVol = 0

        for (const set of allSets) {
          const setVolume = set.reps * set.weightKg
          totalVol += setVolume

          const slug = exerciseSlugMap.get(set.exerciseInSessionId)
          if (!slug) continue

          const exerciseDef = exerciseMap.get(slug)
          if (!exerciseDef) continue

          // Use primaryMuscles to determine category
          for (const muscle of exerciseDef.primaryMuscles) {
            const category = CATEGORY_MAP[muscle] ?? 'conditioning'
            categoryVolumes[category] = (categoryVolumes[category] ?? 0) + setVolume
          }
        }

        // Compute tier and sub-tier progress
        const computedTier = computeTierRank(totalVol)
        const computedProgress = computeSubTierProgress(totalVol)

        // Compute tierMaxVolume: next tier threshold, or current if Elite
        const tierIndex = TIER_THRESHOLDS.findIndex(t => t.tier === computedTier)
        const isElite = tierIndex === TIER_THRESHOLDS.length - 1
        const tierMaxVolume = isElite
          ? TIER_THRESHOLDS[tierIndex].minVolume
          : TIER_THRESHOLDS[tierIndex + 1].minVolume

        const computedRadarAxes = computeRadarAxes(categoryVolumes, tierMaxVolume)

        // Compute week summary: last 7 days
        const now = Date.now()
        const weekCutoff = now - SEVEN_DAYS_MS

        // Unique sessions in last 7 days
        const weekSessionIds = new Set<string>()
        let weekVolume = 0

        for (const set of allSets) {
          if (set.completedAt >= weekCutoff) {
            weekVolume += set.reps * set.weightKg
            const sessionId = exerciseSessionMap.get(set.exerciseInSessionId)
            if (sessionId) {
              // Only count completed sessions
              const completedAt = sessionCompletedAtMap.get(sessionId)
              if (completedAt !== null && completedAt !== undefined) {
                weekSessionIds.add(sessionId)
              }
            }
          }
        }

        // Load lastSeenTier from Dexie
        const lastSeenRecord = await workoutsDb.lastSeenTier.get('singleton')

        if (!cancelled) {
          setTotalVolume(totalVol)
          setTier(computedTier)
          setSubTierProgress(computedProgress)
          setRadarAxes(computedRadarAxes)
          setWeekSummary({ sessionCount: weekSessionIds.size, totalVolume: weekVolume })
          setLastSeenTierState(lastSeenRecord?.tier ?? null)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('useRankingData: failed to compute ranking', err)
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    recalculate()

    return () => {
      cancelled = true
    }
  }, [activeSessionId])

  return {
    tier,
    subTierProgress,
    radarAxes,
    totalVolume,
    weekSummary,
    lastSeenTier,
    setLastSeenTier,
    isLoading,
  }
}
