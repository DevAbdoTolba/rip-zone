'use client'

import type { RadarAxes } from '@/lib/ranking'

interface RadarChartProps {
  axes: RadarAxes
}

const MAX_RADIUS = 120
const CENTER_X = 150
const CENTER_Y = 150
const NUM_AXES = 5
const GRID_LEVELS = [0.33, 0.66, 1.0]

// Axis labels in order, starting from top (Push) going clockwise
const AXIS_LABELS = ['Push', 'Pull', 'Legs', 'Core', 'Conditioning']
// Axis keys corresponding to labels
const AXIS_KEYS: (keyof RadarAxes)[] = ['push', 'pull', 'legs', 'core', 'conditioning']

/**
 * Returns (x, y) for a point at given angle and radius.
 * Angle 0 = top (270deg in standard coords = -PI/2), going clockwise.
 */
function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  // Start at top (-PI/2) and go clockwise
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  }
}

/**
 * Returns SVG polygon points string for an N-gon at given radius.
 */
function polygonPoints(radius: number): string {
  return Array.from({ length: NUM_AXES }, (_, i) => {
    const angle = (360 / NUM_AXES) * i
    const { x, y } = polarToCartesian(angle, radius)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

/**
 * Returns SVG polygon points for data axes.
 * Each axis value is 0-100; mapped to 0-MAX_RADIUS.
 */
function dataPolygonPoints(axes: RadarAxes): string {
  return AXIS_KEYS.map((key, i) => {
    const angle = (360 / NUM_AXES) * i
    const radius = (axes[key] / 100) * MAX_RADIUS
    const { x, y } = polarToCartesian(angle, radius)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

export function RadarChart({ axes }: RadarChartProps) {
  // Label offset: push label further out from vertex for readability
  const LABEL_OFFSET = 18

  return (
    <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Radar chart showing training balance across 5 axes"
      >
        {/* Grid lines: concentric pentagons at 33%, 66%, 100% */}
        {GRID_LEVELS.map((level, idx) => (
          <polygon
            key={idx}
            points={polygonPoints(MAX_RADIUS * level)}
            fill="none"
            stroke="oklch(0.50 0.02 250 / 0.30)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {AXIS_KEYS.map((_, i) => {
          const angle = (360 / NUM_AXES) * i
          const { x, y } = polarToCartesian(angle, MAX_RADIUS)
          return (
            <line
              key={i}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x.toFixed(2)}
              y2={y.toFixed(2)}
              stroke="oklch(0.50 0.02 250 / 0.50)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={dataPolygonPoints(axes)}
          fill="oklch(0.85 0.18 195 / 0.20)"
          stroke="oklch(0.85 0.18 195)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Axis labels */}
        {AXIS_LABELS.map((label, i) => {
          const angle = (360 / NUM_AXES) * i
          const { x, y } = polarToCartesian(angle, MAX_RADIUS + LABEL_OFFSET)
          // Determine text-anchor based on horizontal position
          const textAnchor = x < CENTER_X - 5 ? 'end' : x > CENTER_X + 5 ? 'start' : 'middle'
          // Slight vertical adjustment for top/bottom labels
          const dy = y < CENTER_Y - 5 ? 0 : y > CENTER_Y + 5 ? 12 : 4
          return (
            <text
              key={i}
              x={x.toFixed(2)}
              y={(y - 4 + dy).toFixed(2)}
              textAnchor={textAnchor}
              fill="oklch(0.95 0.01 270)"
              fontSize="12"
              fontFamily="inherit"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
