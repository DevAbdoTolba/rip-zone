import Dexie, { type EntityTable } from 'dexie'
import type { BioMetricEntryId } from '@/types'
import type { TierRank } from '@/types'

// Per D-12: Versioned bio metric entries — each update creates a timestamped record
export interface BioMetricRecord {
  id: BioMetricEntryId
  recordedAt: number
  heightCm: number | null
  weightKg: number | null
  ageYears: number | null
  gender: 'male' | 'female' | null
  bodyFatPct: number | null
}

export interface RankStateRecord {
  id: 'singleton'
  tier: TierRank
  subTierProgress: number
  lastUpdatedAt: number
}

export class ProfileDatabase extends Dexie {
  bioMetrics!: EntityTable<BioMetricRecord, 'id'>
  rankState!: EntityTable<RankStateRecord, 'id'>

  constructor() {
    super('rip-zone-profile')

    // Per D-13: Migration pattern for Dexie schema changes.
    // When adding a new field or index in future phases, add a new version block:
    //
    //   this.version(2).stores({
    //     bioMetrics: 'id, recordedAt, newIndex',
    //     rankState: 'id',
    //   }).upgrade(tx => {
    //     return tx.table('bioMetrics').toCollection().modify(entry => {
    //       if (entry.newField === undefined) {
    //         entry.newField = null
    //       }
    //     })
    //   })
    //
    // Rules:
    // 1. NEVER modify a previous version() block — only append new ones
    // 2. The stores() definition in the latest version is the active schema
    // 3. The upgrade() callback runs once per user when they open the newer version
    // 4. Always handle undefined fields defensively in upgrade()

    this.version(1).stores({
      bioMetrics: 'id, recordedAt',
      rankState: 'id',
    })
  }
}

export const profileDb = new ProfileDatabase()
