'use client'

import { useEffect, useRef } from 'react'
import NormalFront from '@/assets/svg/muscle-map-normal-front.svg'
import NormalBack from '@/assets/svg/muscle-map-normal-back.svg'

const PRIMARY_FILL = 'oklch(0.85 0.18 195)'
const SECONDARY_FILL = 'oklch(0.55 0.10 195)'
const DEFAULT_FILL = 'oklch(0.22 0.02 265)'

// Muscles that appear on the back SVG view
const BACK_MUSCLES = new Set([
  'latissimus-dorsi', 'trapezius-upper', 'trapezius-middle', 'trapezius-lower',
  'rhomboids', 'erector-spinae', 'teres-major', 'teres-minor', 'infraspinatus',
  'posterior-deltoid', 'supraspinatus', 'rotator-cuff',
  'triceps-long-head', 'triceps-lateral-head', 'triceps-medial-head',
  'wrist-extensors', 'lower-back',
  'gluteus-maximus', 'gluteus-medius', 'gluteus-minimus', 'piriformis',
  'hamstrings', 'biceps-femoris', 'semitendinosus', 'semimembranosus', 'popliteus',
  'gastrocnemius', 'soleus', 'peroneus',
])

interface MiniMuscleMapProps {
  primaryMuscles: string[]
  secondaryMuscles: string[]
}

export function MiniMuscleMap({ primaryMuscles, secondaryMuscles }: MiniMuscleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Determine view: if majority of primary muscles are back muscles, show back view
  const backCount = primaryMuscles.filter(m => BACK_MUSCLES.has(m)).length
  const showBack = backCount > primaryMuscles.length - backCount
  const SvgComponent = showBack ? NormalBack : NormalFront

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Reset all muscle paths to default fill
    container.querySelectorAll('path[id^="muscle-"]').forEach((el) => {
      (el as SVGElement).style.fill = DEFAULT_FILL
    })

    // Apply primary highlight
    primaryMuscles.forEach(slug => {
      const el = container.querySelector(`#muscle-${slug}`)
      if (el) (el as SVGElement).style.fill = PRIMARY_FILL
    })

    // Apply secondary highlight (dimmer)
    secondaryMuscles.forEach(slug => {
      const el = container.querySelector(`#muscle-${slug}`)
      if (el) (el as SVGElement).style.fill = SECONDARY_FILL
    })
  }, [primaryMuscles, secondaryMuscles, showBack])

  return (
    <div
      ref={containerRef}
      className="w-[120px] h-[200px] mx-auto"
      aria-label={`Muscle map showing ${primaryMuscles.join(', ')}`}
    >
      <SvgComponent
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
