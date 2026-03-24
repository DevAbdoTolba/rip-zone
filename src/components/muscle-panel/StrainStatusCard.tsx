'use client'

import { STRAIN_COLORS } from '@/lib/strain-engine'
import { StrainLevel } from '@/types'

const STRAIN_PERCENTS: Record<StrainLevel, number> = {
  [StrainLevel.Rested]: 0,
  [StrainLevel.Light]: 30,
  [StrainLevel.Moderate]: 50,
  [StrainLevel.Heavy]: 70,
  [StrainLevel.Strained]: 90,
}

const STRAIN_DISPLAY_TEXT: Record<StrainLevel, string> = {
  [StrainLevel.Rested]: 'Rested',
  [StrainLevel.Light]: 'Light strain',
  [StrainLevel.Moderate]: 'Moderate strain',
  [StrainLevel.Heavy]: 'Heavy strain',
  [StrainLevel.Strained]: 'Strained',
}

interface StrainStatusCardProps {
  level: StrainLevel
}

export function StrainStatusCard({ level }: StrainStatusCardProps) {
  const pct = STRAIN_PERCENTS[level]
  const color = STRAIN_COLORS[level]
  const displayText = STRAIN_DISPLAY_TEXT[level]

  const isRested = level === StrainLevel.Rested

  // Build badge background color with 15% opacity
  // For hex colors: append '26' (hex for 15% = 0.15 * 255 ≈ 38 = 0x26)
  // For oklch: use oklch(... / 0.15) notation
  const badgeBackgroundColor = isRested
    ? undefined
    : color.startsWith('#')
      ? color + '26'
      : color.startsWith('oklch')
        ? color.replace(')', ' / 0.15)').replace('oklch(', 'oklch(')
        : color + '26'

  return (
    <div data-testid="strain-status-card" className="bg-muted rounded-lg p-3">
      <h3 className="text-[14px] font-semibold text-foreground mb-2">Recovery Status</h3>
      <div className="flex items-center">
        {isRested ? (
          <span className="bg-muted text-muted-foreground text-[14px] rounded-full px-2 py-0.5 font-normal">
            {displayText}
          </span>
        ) : (
          <span
            className="text-[14px] rounded-full px-2 py-0.5 font-normal"
            style={{ backgroundColor: badgeBackgroundColor, color }}
          >
            {displayText}
          </span>
        )}
        <div
          className="flex-1 bg-muted rounded-full h-2 ml-3"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={STRAIN_DISPLAY_TEXT[level]}
        >
          <div
            className="rounded-full h-2 transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}
