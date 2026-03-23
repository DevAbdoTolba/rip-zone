import type { Difficulty } from '@/types/workout'
import type { WorkoutSessionRecord } from '@/lib/db/workouts'

export function inferUserLevel(sessions: Pick<WorkoutSessionRecord, 'startedAt'>[]): Difficulty {
  const count = sessions.length
  if (count < 5) return 'beginner'
  const firstDate = sessions.reduce((a, b) => Math.min(a, b.startedAt), Infinity)
  const weeksActive = (Date.now() - firstDate) / (7 * 24 * 3600 * 1000)
  if (count >= 30 || weeksActive >= 12) return 'advanced'
  return 'intermediate'
}

const LEVEL_ORDER: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }

export function isPlanAboveLevel(planDifficulty: Difficulty, userLevel: Difficulty): boolean {
  return LEVEL_ORDER[planDifficulty] > LEVEL_ORDER[userLevel]
}
