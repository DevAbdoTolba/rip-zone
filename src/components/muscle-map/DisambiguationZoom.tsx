'use client'

import { useMapStore } from '@/stores/useMapStore'
import { MUSCLE_CENTROIDS, MUSCLE_DISPLAY_NAMES } from './muscle-clusters'
import type { MuscleSlug } from '@/types'

export function DisambiguationZoom() {
  const { zoomRegion, selectMuscle, setZoomRegion } = useMapStore()

  if (!zoomRegion) return null

  const handleMuscleSelect = (slug: MuscleSlug) => {
    selectMuscle(slug)
    setZoomRegion(null) // Auto-zoom back per D-16
  }

  const handleBackdropClick = () => {
    setZoomRegion(null) // Dismiss zoom without selecting
  }

  // Parse viewBox to get coordinates for the backdrop rect
  const [vbX, vbY, vbW, vbH] = zoomRegion.viewBox.split(' ').map(Number)

  return (
    <>
      {/* Backdrop rect for dismissing zoom — covers full viewBox area */}
      <rect
        x={vbX}
        y={vbY}
        width={vbW}
        height={vbH}
        fill="transparent"
        onClick={handleBackdropClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Cluster title label */}
      <text
        x={vbX + vbW / 2}
        y={vbY + 4}
        fill="oklch(0.95 0.01 270)"
        fontSize="4"
        fontWeight="600"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
      >
        {zoomRegion.label}
      </text>

      {/* Muscle name labels at centroids — render above dim overlay */}
      {zoomRegion.muscles.map((slug) => {
        const centroid = MUSCLE_CENTROIDS[slug]
        const displayName = MUSCLE_DISPLAY_NAMES[slug] || slug
        if (!centroid) return null
        return (
          <text
            key={slug}
            x={centroid.x}
            y={centroid.y - 3}
            fill="oklch(0.95 0.01 270)"
            fontSize="3"
            fontWeight="400"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            {displayName}
          </text>
        )
      })}

      {/* Invisible hit areas for each muscle in the cluster — for selecting */}
      {zoomRegion.muscles.map((slug) => {
        const centroid = MUSCLE_CENTROIDS[slug]
        if (!centroid) return null
        return (
          <rect
            key={`hit-${slug}`}
            x={centroid.x - 8}
            y={centroid.y - 8}
            width={16}
            height={16}
            fill="transparent"
            onClick={(e) => {
              e.stopPropagation()
              handleMuscleSelect(slug)
            }}
            style={{ cursor: 'pointer' }}
          />
        )
      })}
    </>
  )
}
