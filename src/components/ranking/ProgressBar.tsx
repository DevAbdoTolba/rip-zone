'use client'

import { TierRank } from '@/types/ranking'

interface ProgressBarProps {
  progress: number // 0-1
  currentTier: TierRank
  nextTier: TierRank | null
}

export function ProgressBar({ progress, currentTier, nextTier }: ProgressBarProps) {
  const subTierProgress = Math.min(1, Math.max(0, progress))
  const widthPercent = subTierProgress * 100
  const showCenterLabel = widthPercent > 15

  return (
    <div className="w-full">
      {/* Tier labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{currentTier}</span>
        <span>{nextTier ?? 'MAX'}</span>
      </div>

      {/* Progress track */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        {/* Filled portion */}
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${widthPercent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(widthPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${Math.round(widthPercent)}% progress toward ${nextTier ?? 'max tier'}`}
        />
        {/* Center percentage label */}
        {showCenterLabel && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-primary-foreground pointer-events-none"
            aria-hidden="true"
          >
            {Math.round(widthPercent)}%
          </span>
        )}
      </div>
    </div>
  )
}
