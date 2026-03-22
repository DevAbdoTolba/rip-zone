import { create } from 'zustand'
import type { BioMetricRecord } from '@/lib/db/profile'

interface ProfileState {
  latestBio: BioMetricRecord | null
  // Per D-19: Manual sync with Dexie
  loadLatestBio: () => Promise<void>
  saveBio: (entry: BioMetricRecord) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  latestBio: null,
  loadLatestBio: async () => {
    const { profileDb } = await import('@/lib/db/profile')
    const latest = await profileDb.bioMetrics
      .orderBy('recordedAt')
      .last()
    set({ latestBio: latest ?? null })
  },
  saveBio: async (entry) => {
    const { profileDb } = await import('@/lib/db/profile')
    await profileDb.bioMetrics.put(entry)
    set({ latestBio: entry })
  },
}))
