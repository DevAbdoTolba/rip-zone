import type { BioMetricRecord } from '@/lib/db/profile'

const BIO_FIELDS: Array<keyof BioMetricRecord> = [
  'heightCm',
  'weightKg',
  'ageYears',
  'gender',
  'bodyFatPct',
  'measurementsCm',
]

export function computeAccuracyPct(bio: BioMetricRecord | null): number {
  if (!bio) return 0
  const filled = BIO_FIELDS.filter(f => bio[f] !== null && bio[f] !== undefined).length
  return Math.round((filled / BIO_FIELDS.length) * 100)
}
