'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useMapStore } from '@/stores/useMapStore'
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'
import { STRAIN_COLORS } from '@/lib/strain-engine'

// SVGR imports — each returns a React component
import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'
import AdvancedFront from '@/assets/svg/muscle-map-advanced-front.svg'
import AdvancedBack from '@/assets/svg/muscle-map-advanced-back.svg'
import AnatomyFront from '@/assets/svg/muscle-map-anatomy-front.svg'
import AnatomyBack from '@/assets/svg/muscle-map-anatomy-back.svg'

import type { DetailMode, MapView } from '@/stores/useMapStore'
import { CLUSTER_MAP } from './muscle-clusters'
import { DisambiguationZoom } from './DisambiguationZoom'

const SVG_MAP: Record<DetailMode, Record<MapView, React.FC<React.SVGProps<SVGSVGElement>>>> = {
  normal: { front: NormalFront, back: NormalBack },
  advanced: { front: AdvancedFront, back: AdvancedBack },
  anatomy: { front: AnatomyFront, back: AnatomyBack },
}

interface MuscleMapCanvasProps {
  strainMap: Map<MuscleSlug, StrainLevel>
}

/**
 * Apply strain color fill to a muscle slug, handling bilateral anatomy mode paths.
 * Attempts base path first, then tries -left/-right variants for anatomy mode.
 * NOTE: Does NOT use else between base and bilateral lookups — some muscles have BOTH
 * a base path AND bilateral paths in anatomy mode. All matching paths receive the fill.
 */
function applyStrainToSlug(container: HTMLDivElement, slug: string, color: string) {
  const base = container.querySelector<SVGPathElement>(`#muscle-${slug}`)
  if (base) {
    base.style.fill = color
  }
  // Also try bilateral variants for anatomy mode (Pitfall 5 from RESEARCH.md)
  const left = container.querySelector<SVGPathElement>(`#muscle-${slug}-left`)
  const right = container.querySelector<SVGPathElement>(`#muscle-${slug}-right`)
  if (left) left.style.fill = color
  if (right) right.style.fill = color
}

export function MuscleMapCanvas({ strainMap }: MuscleMapCanvasProps) {
  const { currentView, detailMode, selectedMuscle, selectMuscle, zoomRegion, setZoomRegion } = useMapStore()
  const svgContainerRef = useRef<HTMLDivElement>(null)

  const CurrentSvg = SVG_MAP[detailMode][currentView]

  // Handle click on hit-layer paths
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as SVGElement
      const hitElement = target.closest('[id^="hit-"]') as SVGElement | null
      const id = hitElement?.id || (target.id?.startsWith('hit-') ? target.id : null)

      if (!id) return

      // D-15: Disambiguation only in Advanced and Anatomy modes
      if (detailMode !== 'normal' && CLUSTER_MAP[id]) {
        setZoomRegion(CLUSTER_MAP[id])
        return
      }

      // Direct selection — extract slug from hit target ID
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
    [selectedMuscle, selectMuscle, detailMode, setZoomRegion]
  )

  // Apply strain heatmap fills to muscle paths
  // Placed BEFORE the data-selected effect so selection always wins
  useEffect(() => {
    const container = svgContainerRef.current
    if (!container) return

    // Reset all muscle path inline fills (lets CSS defaults and data-selected rule take over)
    container.querySelectorAll<SVGPathElement>('path[id^="muscle-"]').forEach(el => {
      el.style.fill = ''
    })

    // Apply strain colors (skip selected muscle — selection wins per UI-SPEC)
    for (const [slug, level] of strainMap) {
      if (slug === selectedMuscle) continue
      if (level === StrainLevel.Rested) continue
      applyStrainToSlug(container, slug, STRAIN_COLORS[level])
    }
    // Dependencies: currentView and detailMode ensure fills re-apply after SVG component
    // swap (fresh DOM nodes — Pitfall 1). selectedMuscle ensures previously-selected muscle
    // gets its strain color back after deselection.
  }, [strainMap, currentView, detailMode, selectedMuscle])

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
      className="relative w-full max-w-sm mx-auto"
      onClick={handleClick}
    >
      <CurrentSvg
        className="w-full h-auto"
        viewBox={zoomRegion?.viewBox ?? undefined}
        aria-label={`${currentView === 'front' ? 'Front' : 'Back'} muscle map`}
      />
      {/* Disambiguation overlay — rendered as a second SVG layer on top */}
      {zoomRegion && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={zoomRegion.viewBox}
          aria-label={`Disambiguation: ${zoomRegion.label}`}
        >
          {/* Dim overlay on full viewBox area */}
          <rect
            x={zoomRegion.viewBox.split(' ').map(Number)[0]}
            y={zoomRegion.viewBox.split(' ').map(Number)[1]}
            width={zoomRegion.viewBox.split(' ').map(Number)[2]}
            height={zoomRegion.viewBox.split(' ').map(Number)[3]}
            className="disambiguation-overlay"
          />
          <DisambiguationZoom />
        </svg>
      )}
    </div>
  )
}
