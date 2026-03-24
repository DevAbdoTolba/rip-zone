'use client'

import { Shield } from 'lucide-react'
import { TierRank } from '@/types/ranking'

interface TierBadgeProps {
  tier: TierRank
  totalVolume: number
}

const TIER_COLORS: Record<TierRank, string> = {
  [TierRank.Iron]: '#8B8B8B',
  [TierRank.Bronze]: '#CD7F32',
  [TierRank.Silver]: '#C0C0C0',
  [TierRank.Gold]: '#FFD700',
  [TierRank.Platinum]: '#E5E4E2',
  [TierRank.Diamond]: '#B9F2FF',
  [TierRank.Elite]: '#FF4500',
}

export function TierBadge({ tier, totalVolume }: TierBadgeProps) {
  const color = TIER_COLORS[tier]

  return (
    <div className="flex flex-col items-center gap-2">
      <Shield size={32} color={color} aria-hidden="true" />
      <p className="text-2xl font-bold" style={{ color }}>
        {tier}
      </p>
      <p className="text-sm text-muted-foreground">
        {totalVolume.toLocaleString()} kg lifetime
      </p>
    </div>
  )
}
