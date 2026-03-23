import type { SetLogRecord } from '@/lib/db/workouts'

export type PRMap = Map<number, number>  // reps -> bestWeightKg

export function computePRs(sets: Pick<SetLogRecord, 'reps' | 'weightKg'>[]): PRMap {
  const map = new Map<number, number>()
  for (const s of sets) {
    const current = map.get(s.reps)
    if (current === undefined || s.weightKg > current) {
      map.set(s.reps, s.weightKg)
    }
  }
  return map
}

export function isNewPR(newSet: { reps: number; weightKg: number }, historicPRs: PRMap): boolean {
  const best = historicPRs.get(newSet.reps)
  return best === undefined || newSet.weightKg > best
}
