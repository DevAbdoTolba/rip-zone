'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useMapStore } from '@/stores/useMapStore'
import type { MuscleSlug } from '@/types'

// SVGR imports — each returns a React component
import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'
import AdvancedFront from '@/assets/svg/muscle-map-advanced-front.svg'
import AdvancedBack from '@/assets/svg/muscle-map-advanced-back.svg'
import AnatomyFront from '@/assets/svg/muscle-map-anatomy-front.svg'
import AnatomyBack from '@/assets/svg/muscle-map-anatomy-back.svg'

import type { DetailMode, MapView } from '@/stores/useMapStore'

const SVG_MAP: Record<DetailMode, Record<MapView, React.FC<React.SVGProps<SVGSVGElement>>>> = {
  normal: { front: NormalFront, back: NormalBack },
  advanced: { front: AdvancedFront, back: AdvancedBack },
  anatomy: { front: AnatomyFront, back: AnatomyBack },
}

export function MuscleMapCanvas() {
  const { currentView, detailMode, selectedMuscle, selectMuscle, zoomRegion } = useMapStore()
  const svgContainerRef = useRef<HTMLDivElement>(null)

  const CurrentSvg = SVG_MAP[detailMode][currentView]

  // Handle click on hit-layer paths
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as SVGElement
      const id = target.id || target.closest('[id^="hit-"]')?.id

      if (!id) return

      // Hit target IDs: "hit-muscle-biceps-brachii" -> extract "biceps-brachii"
      if (id.startsWith('hit-muscle-')) {
        const slug = id.replace('hit-muscle-', '') as MuscleSlug
        // If same muscle is already selected, deselect
        if (selectedMuscle === slug) {
          selectMuscle(null)
        } else {
          selectMuscle(slug)
        }
      }
    },
    [selectedMuscle, selectMuscle]
  )

  // Apply data-selected attribute to the selected muscle's visual path
  useEffect(() => {
    const container = svgContainerRef.current
    if (!container) return

    // Clear all previous selections
    container.querySelectorAll('path[data-selected="true"]').forEach((el) => {
      el.removeAttribute('data-selected')
    })

    // Set selected on the matching visual-layer path
    if (selectedMuscle) {
      const visualPath = container.querySelector(`#muscle-${selectedMuscle}`)
      if (visualPath) {
        visualPath.setAttribute('data-selected', 'true')
      }
    }
  }, [selectedMuscle, currentView, detailMode])

  return (
    <div
      ref={svgContainerRef}
      data-view={currentView}
      data-detail-mode={detailMode}
      data-selected-muscle={selectedMuscle ?? undefined}
      className="w-full max-w-sm mx-auto"
      onClick={handleClick}
    >
      <CurrentSvg
        className="w-full h-auto"
        viewBox={zoomRegion?.viewBox ?? undefined}
        aria-label={`${currentView === 'front' ? 'Front' : 'Back'} muscle map`}
      />
    </div>
  )
}
