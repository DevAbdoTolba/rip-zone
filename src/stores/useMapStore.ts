import { create } from 'zustand'
import type { MuscleSlug } from '@/types'

export type MapView = 'front' | 'back'
export type DetailMode = 'normal' | 'advanced' | 'anatomy'

export interface ZoomRegion {
  muscles: MuscleSlug[]
  viewBox: string
  label: string
}

interface MapState {
  currentView: MapView
  selectedMuscle: MuscleSlug | null
  detailMode: DetailMode
  zoomRegion: ZoomRegion | null
  setView: (view: MapView) => void
  selectMuscle: (slug: MuscleSlug | null) => void
  setDetailMode: (mode: DetailMode) => void
  setZoomRegion: (region: ZoomRegion | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  currentView: 'front',
  selectedMuscle: null,
  detailMode: 'normal',
  zoomRegion: null,
  setView: (view) => set({ currentView: view }),
  selectMuscle: (slug) => set({ selectedMuscle: slug }),
  setDetailMode: (mode) => set({ detailMode: mode, zoomRegion: null }),
  setZoomRegion: (region) => set({ zoomRegion: region }),
}))
