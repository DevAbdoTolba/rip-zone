import { create } from 'zustand'
import type { RankStateRecord } from '@/lib/db/profile'

interface RankStoreState {
  currentRank: RankStateRecord | null
  // Per D-19: Manual sync with Dexie
  loadRank: () => Promise<void>
  saveRank: (rank: RankStateRecord) => Promise<void>
}

export const useRankStore = create<RankStoreState>((set) => ({
  currentRank: null,
  loadRank: async () => {
    const { profileDb } = await import('@/lib/db/profile')
    const rank = await profileDb.rankState.get('singleton')
    set({ currentRank: rank ?? null })
  },
  saveRank: async (rank) => {
    const { profileDb } = await import('@/lib/db/profile')
    await profileDb.rankState.put(rank)
    set({ currentRank: rank })
  },
}))
