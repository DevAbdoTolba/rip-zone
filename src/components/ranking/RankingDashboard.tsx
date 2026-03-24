'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRankingData } from '@/hooks/useRankingData'
import { TIER_THRESHOLDS } from '@/lib/ranking'
import { TierRank } from '@/types/ranking'
import { RadarChart } from './RadarChart'
import { TierBadge } from './TierBadge'
import { ProgressBar } from './ProgressBar'
import { CelebrationOverlay } from './CelebrationOverlay'
import { useProfileStore } from '@/stores/useProfileStore'
import { computeAccuracyPct } from '@/lib/bio-accuracy'
import { AccuracyRing } from '@/components/profile/AccuracyRing'

/**
 * Derives the next tier from TIER_THRESHOLDS given current tier.
 * Returns null if current tier is Elite (no next tier).
 */
function getNextTier(currentTier: TierRank): TierRank | null {
  const idx = TIER_THRESHOLDS.findIndex(t => t.tier === currentTier)
  if (idx === -1 || idx === TIER_THRESHOLDS.length - 1) return null
  return TIER_THRESHOLDS[idx + 1].tier
}

export function RankingDashboard() {
  const { tier, subTierProgress, radarAxes, totalVolume, weekSummary, lastSeenTier, setLastSeenTier, isLoading } =
    useRankingData()

  const [showCelebration, setShowCelebration] = useState(false)

  // Subscribe to bio for accuracy ring and enhanced badge (BIO-02)
  const latestBio = useProfileStore(s => s.latestBio)
  const accuracyPct = computeAccuracyPct(latestBio)

  // Load bio on mount
  useEffect(() => {
    useProfileStore.getState().loadLatestBio()
  }, [])

  // Celebration logic: trigger when tier has advanced since last seen
  useEffect(() => {
    if (isLoading) return

    if (lastSeenTier === null) {
      // First ever visit — silently record current tier, no celebration
      setLastSeenTier(tier)
    } else if (lastSeenTier !== tier) {
      // Tier has changed since last visit — show celebration
      setShowCelebration(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const handleDismiss = () => {
    setShowCelebration(false)
    setLastSeenTier(tier)
  }

  const nextTier = getNextTier(tier)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 animate-pulse">
        {/* Week summary skeleton */}
        <div className="w-full h-16 rounded-xl bg-muted" />
        {/* Radar chart skeleton */}
        <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-muted" />
        {/* Tier badge skeleton */}
        <div className="w-32 h-16 rounded-lg bg-muted" />
        {/* Progress bar skeleton */}
        <div className="w-full max-w-sm h-8 rounded-full bg-muted" />
      </div>
    )
  }

  // Empty state: no workouts logged yet
  if (totalVolume === 0) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Show radar chart with all-zero axes for visual outline */}
        <RadarChart axes={radarAxes} />
        <p className="text-muted-foreground text-base">
          Log your first workout to start ranking
        </p>
        <Link
          href="/workout"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity"
        >
          Start a workout
        </Link>
      </div>
    )
  }

  return (
    <>
      {showCelebration && (
        <CelebrationOverlay newTier={tier} onDismiss={handleDismiss} />
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Week summary card */}
        <div className="w-full bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-semibold text-foreground">
              {weekSummary.sessionCount} {weekSummary.sessionCount === 1 ? 'session' : 'sessions'}
            </span>{' '}
            this week
            {weekSummary.totalVolume > 0 && (
              <>
                {' / '}
                <span className="font-semibold text-foreground">
                  {weekSummary.totalVolume.toLocaleString()} kg
                </span>
              </>
            )}
          </p>
        </div>

        {/* Radar chart hero */}
        <RadarChart axes={radarAxes} />

        {/* Tier badge */}
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} totalVolume={totalVolume} />
          {accuracyPct > 0 && (
            <span className="text-[10px] text-primary px-1.5 py-0.5 rounded-full border border-primary/30">
              enhanced
            </span>
          )}
        </div>

        {/* Sub-tier progress bar */}
        <div className="w-full max-w-sm mx-auto">
          <ProgressBar
            progress={subTierProgress}
            currentTier={tier}
            nextTier={nextTier}
          />
        </div>

        {/* Accuracy indicator */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <AccuracyRing pct={accuracyPct} />
          <span className="text-[12px] text-muted-foreground">Accuracy</span>
        </div>

        {/* Relative strength — only when bodyweight provided */}
        {latestBio?.weightKg && totalVolume > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Relative strength: {(totalVolume / latestBio.weightKg).toFixed(1)} kg/kg
            <span className="ml-1 text-[10px] text-primary px-1 py-0.5 rounded-full border border-primary/30">
              enhanced
            </span>
          </p>
        )}
      </div>
    </>
  )
}
