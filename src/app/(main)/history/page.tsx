'use client'

import { useEffect, useState } from 'react'
import { ContributionGraph } from '@/components/history/ContributionGraph'
import { SessionRow } from '@/components/history/SessionRow'
import { SessionDetail } from '@/components/history/SessionDetail'
import type { WorkoutSessionRecord, ExerciseInSessionRecord, SetLogRecord } from '@/lib/db/workouts'
import type { ExerciseSlug } from '@/types'
import { computePRs, isNewPR } from '@/lib/pr-detection'

interface SessionSummary {
  session: WorkoutSessionRecord
  exerciseCount: number
  totalSets: number
  totalVolume: number
  exercises: Array<{
    slug: ExerciseSlug
    name: string
    sets: SetLogRecord[]
    isPR: (set: SetLogRecord) => boolean
  }>
}

interface DailyVolume {
  date: string
  volume: number
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [dailyVolumes, setDailyVolumes] = useState<DailyVolume[]>([])
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      try {
        const { workoutsDb } = await import('@/lib/db/workouts')

        // Load exercise names from data
        const exercisesData = await import('@/../data/exercises.json')
        const exerciseNameMap = new Map<string, string>()
        for (const ex of exercisesData.default as Array<{ slug: string; name: string }>) {
          exerciseNameMap.set(ex.slug, ex.name)
        }

        // Load all completed sessions in reverse chronological order
        const allSessions = await workoutsDb.sessions.orderBy('startedAt').reverse().toArray()
        const completed = allSessions.filter(s => s.completedAt !== null)

        // For each session, load exercises and sets
        const volumeByDate = new Map<string, number>()
        const sessionSummaries: SessionSummary[] = []

        for (const session of completed) {
          const exercises: ExerciseInSessionRecord[] = await workoutsDb.exercisesInSession
            .where('sessionId')
            .equals(session.id)
            .sortBy('orderIndex')

          let totalSets = 0
          let totalVolume = 0
          const exerciseDetails: SessionSummary['exercises'] = []

          // Collect all sets across this session for PR comparison
          const allSessionSets: SetLogRecord[] = []
          for (const ex of exercises) {
            const sets = await workoutsDb.sets
              .where('exerciseInSessionId')
              .equals(ex.id)
              .sortBy('setNumber')
            allSessionSets.push(...sets)
          }

          for (const ex of exercises) {
            const sets = await workoutsDb.sets
              .where('exerciseInSessionId')
              .equals(ex.id)
              .sortBy('setNumber')

            totalSets += sets.length
            const exerciseVolume = sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0)
            totalVolume += exerciseVolume

            // Compute PRs for this exercise using historical sets
            const historicPRs = computePRs(sets.map(s => ({ reps: s.reps, weightKg: s.weightKg })))

            exerciseDetails.push({
              slug: ex.exerciseSlug,
              name: exerciseNameMap.get(ex.exerciseSlug) ?? ex.exerciseSlug,
              sets,
              isPR: (set: SetLogRecord) => isNewPR({ reps: set.reps, weightKg: set.weightKg }, historicPRs),
            })
          }

          // Aggregate daily volume for contribution graph
          const dateStr = new Date(session.startedAt).toISOString().slice(0, 10)
          volumeByDate.set(dateStr, (volumeByDate.get(dateStr) ?? 0) + totalVolume)

          sessionSummaries.push({
            session,
            exerciseCount: exercises.length,
            totalSets,
            totalVolume,
            exercises: exerciseDetails,
          })
        }

        // Build daily volumes array for ContributionGraph
        const dailyVols: DailyVolume[] = Array.from(volumeByDate.entries()).map(([date, volume]) => ({
          date,
          volume,
        }))

        if (!cancelled) {
          setSessions(sessionSummaries)
          setDailyVolumes(dailyVols)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load workout history:', err)
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()
    return () => { cancelled = true }
  }, [])

  function handleToggleSession(sessionId: string) {
    setExpandedSessionId(prev => prev === sessionId ? null : sessionId)
  }

  return (
    <main className="flex-1 pb-20 overflow-y-auto">
      <h1 className="text-2xl font-bold text-foreground px-4 pt-4">History</h1>

      {!isLoading && (
        <ContributionGraph sessions={dailyVolumes} />
      )}

      {isLoading ? (
        <div className="px-4 pt-8 text-center text-muted-foreground text-[14px]">
          Loading history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="px-4 pt-8 text-center">
          <p className="text-muted-foreground text-[16px]">No workouts yet. Start your first workout!</p>
        </div>
      ) : (
        <div className="mt-4">
          {sessions.map(({ session, exerciseCount, totalSets, totalVolume, exercises }) => (
            <div key={session.id}>
              <SessionRow
                session={session}
                exerciseCount={exerciseCount}
                totalSets={totalSets}
                totalVolume={totalVolume}
                isExpanded={expandedSessionId === session.id}
                onToggle={() => handleToggleSession(session.id)}
              />
              {expandedSessionId === session.id && (
                <SessionDetail exercises={exercises} />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
