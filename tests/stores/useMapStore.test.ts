import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore } from '@/stores/useMapStore'
import type { MuscleSlug } from '@/types'

describe('useMapStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useMapStore.setState({
      currentView: 'front',
      selectedMuscle: null,
      detailMode: 'normal',
      zoomRegion: null,
    })
  })

  describe('existing fields', () => {
    it('initializes with front view', () => {
      expect(useMapStore.getState().currentView).toBe('front')
    })

    it('initializes with no selected muscle', () => {
      expect(useMapStore.getState().selectedMuscle).toBeNull()
    })

    it('setView changes currentView', () => {
      useMapStore.getState().setView('back')
      expect(useMapStore.getState().currentView).toBe('back')
    })

    it('selectMuscle sets selectedMuscle', () => {
      const slug = 'biceps-brachii' as MuscleSlug
      useMapStore.getState().selectMuscle(slug)
      expect(useMapStore.getState().selectedMuscle).toBe(slug)
    })

    it('selectMuscle with null clears selection', () => {
      useMapStore.getState().selectMuscle('biceps-brachii' as MuscleSlug)
      useMapStore.getState().selectMuscle(null)
      expect(useMapStore.getState().selectedMuscle).toBeNull()
    })
  })

  describe('detailMode', () => {
    it('initializes with normal mode', () => {
      expect(useMapStore.getState().detailMode).toBe('normal')
    })

    it('setDetailMode changes to advanced', () => {
      useMapStore.getState().setDetailMode('advanced')
      expect(useMapStore.getState().detailMode).toBe('advanced')
    })

    it('setDetailMode changes to anatomy', () => {
      useMapStore.getState().setDetailMode('anatomy')
      expect(useMapStore.getState().detailMode).toBe('anatomy')
    })

    it('setDetailMode resets zoomRegion to null', () => {
      useMapStore.getState().setZoomRegion({
        muscles: ['supraspinatus' as MuscleSlug],
        viewBox: '120 60 80 60',
        label: 'Rotator Cuff',
      })
      useMapStore.getState().setDetailMode('normal')
      expect(useMapStore.getState().zoomRegion).toBeNull()
    })
  })

  describe('zoomRegion', () => {
    it('initializes with null zoomRegion', () => {
      expect(useMapStore.getState().zoomRegion).toBeNull()
    })

    it('setZoomRegion sets region', () => {
      const region = {
        muscles: ['supraspinatus' as MuscleSlug, 'infraspinatus' as MuscleSlug],
        viewBox: '120 60 80 60',
        label: 'Rotator Cuff',
      }
      useMapStore.getState().setZoomRegion(region)
      expect(useMapStore.getState().zoomRegion).toEqual(region)
    })

    it('setZoomRegion with null clears region', () => {
      useMapStore.getState().setZoomRegion({
        muscles: ['supraspinatus' as MuscleSlug],
        viewBox: '120 60 80 60',
        label: 'Test',
      })
      useMapStore.getState().setZoomRegion(null)
      expect(useMapStore.getState().zoomRegion).toBeNull()
    })
  })
})
