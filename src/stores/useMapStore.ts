import { create } from 'zustand'
import type { MuscleSlug } from '@/types'

type MapView = 'front' | 'back'

interface MapState {
  currentView: MapView
  selectedMuscle: MuscleSlug | null
  setView: (view: MapView) => void
  selectMuscle: (slug: MuscleSlug | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  currentView: 'front',
  selectedMuscle: null,
  setView: (view) => set({ currentView: view }),
  selectMuscle: (slug) => set({ selectedMuscle: slug }),
}))
