import type { Brand } from './branded'

export type BioMetricEntryId = Brand<string, 'BioMetricEntryId'>

export interface BioMetricEntry {
  id: BioMetricEntryId
  recordedAt: number
  heightCm: number | null
  weightKg: number | null
  ageYears: number | null
  gender: 'male' | 'female' | null
  bodyFatPct: number | null
}
