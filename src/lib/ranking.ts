import { TierRank } from '@/types/ranking'

// Tier thresholds: ordered array from lowest to highest
// Total volume = sum of (reps × weightKg) across all sets ever logged
export const TIER_THRESHOLDS: Array<{ tier: TierRank; minVolume: number }> = [
  { tier: TierRank.Iron, minVolume: 0 },
  { tier: TierRank.Bronze, minVolume: 5000 },
  { tier: TierRank.Silver, minVolume: 25000 },
  { tier: TierRank.Gold, minVolume: 100000 },
  { tier: TierRank.Platinum, minVolume: 300000 },
  { tier: TierRank.Diamond, minVolume: 750000 },
  { tier: TierRank.Elite, minVolume: 1500000 },
]

// Maps muscle group slugs to 5 training categories.
// Keys come from exercises.json primaryMuscles field.
// Unmatched slugs default to 'conditioning' at call sites.
export const CATEGORY_MAP: Record<string, 'push' | 'pull' | 'legs' | 'core' | 'conditioning'> = {
  // Push
  chest: 'push',
  shoulders: 'push',
  triceps: 'push',
  'front-deltoid': 'push',
  'lateral-deltoid': 'push',
  'rear-deltoid': 'push',
  // Actual muscle slugs used in exercises.json
  'pectoralis-major': 'push',
  'anterior-deltoid': 'push',
  'lateral-deltoid-actual': 'push',
  'triceps-long-head': 'push',
  'triceps-lateral-head': 'push',
  'triceps-medial-head': 'push',
  'serratus-anterior': 'push',

  // Pull
  back: 'pull',
  biceps: 'pull',
  lats: 'pull',
  rhomboids: 'pull',
  trapezius: 'pull',
  // Actual muscle slugs used in exercises.json
  'latissimus-dorsi': 'pull',
  'rhomboid-major': 'pull',
  'rhomboid-minor': 'pull',
  'trapezius-upper': 'pull',
  'trapezius-middle': 'pull',
  'trapezius-lower': 'pull',
  'biceps-brachii': 'pull',
  'biceps-long-head': 'pull',
  'biceps-short-head': 'pull',
  'brachialis': 'pull',
  'brachioradialis': 'pull',
  'rear-deltoid-pull': 'pull',
  'posterior-deltoid': 'pull',
  'teres-major': 'pull',
  'teres-minor': 'pull',
  'infraspinatus': 'pull',
  'subscapularis': 'pull',
  'supraspinatus': 'pull',

  // Legs
  quads: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  'hip-flexors': 'legs',
  adductors: 'legs',
  // Actual muscle slugs used in exercises.json
  'quadriceps': 'legs',
  'rectus-femoris': 'legs',
  'vastus-lateralis': 'legs',
  'vastus-medialis': 'legs',
  'vastus-intermedius': 'legs',
  'biceps-femoris': 'legs',
  'semitendinosus': 'legs',
  'semimembranosus': 'legs',
  'gluteus-maximus': 'legs',
  'gluteus-medius': 'legs',
  'gluteus-minimus': 'legs',
  'gastrocnemius': 'legs',
  'soleus': 'legs',
  'tibialis-anterior': 'legs',
  'hip-flexor': 'legs',
  'adductor-magnus': 'legs',
  'adductor-longus': 'legs',
  'adductor-brevis': 'legs',
  'gracilis': 'legs',
  'tensor-fasciae-latae': 'legs',

  // Core
  abs: 'core',
  obliques: 'core',
  'rectus-abdominis': 'core',
  'external-obliques': 'core',
  'erector-spinae': 'core',
  'lower-back': 'core',
  // Actual muscle slugs
  'transverse-abdominis': 'core',
  'internal-obliques': 'core',
  'multifidus': 'core',
  'quadratus-lumborum': 'core',
}

export type RadarAxes = {
  push: number
  pull: number
  legs: number
  core: number
  conditioning: number
}

/**
 * Returns the TierRank for the given total volume (reps × weightKg summed).
 * Walks thresholds in reverse and returns the first where volume >= minVolume.
 * Caps at Elite.
 */
export function computeTierRank(totalVolume: number): TierRank {
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalVolume >= TIER_THRESHOLDS[i].minVolume) {
      return TIER_THRESHOLDS[i].tier
    }
  }
  return TierRank.Iron
}

/**
 * Returns a 0-1 fraction representing progress within the current tier.
 * 0 = just entered current tier, 1 = at next tier threshold (or Elite = 1).
 */
export function computeSubTierProgress(totalVolume: number): number {
  const tierIndex = TIER_THRESHOLDS.findIndex(t => t.tier === computeTierRank(totalVolume))

  // Elite: no next tier, always full
  if (tierIndex === TIER_THRESHOLDS.length - 1) {
    return 1
  }

  const currentMin = TIER_THRESHOLDS[tierIndex].minVolume
  const nextMin = TIER_THRESHOLDS[tierIndex + 1].minVolume
  return (totalVolume - currentMin) / (nextMin - currentMin)
}

/**
 * Returns 5-axis radar scores (each 0-100) from per-category volumes.
 * Each axis is normalized relative to tierMaxVolume.
 * tierMaxVolume = the next tier threshold (or current tier max if Elite).
 */
export function computeRadarAxes(
  categoryVolumes: Record<string, number>,
  tierMaxVolume: number
): RadarAxes {
  // When tierMaxVolume is 0, all axes are 0 — no reference point to normalize against
  const normalize = (key: string): number => {
    if (tierMaxVolume <= 0) return 0
    const vol = categoryVolumes[key] ?? 0
    return Math.min(100, Math.round((vol / tierMaxVolume) * 100))
  }

  return {
    push: normalize('push'),
    pull: normalize('pull'),
    legs: normalize('legs'),
    core: normalize('core'),
    conditioning: normalize('conditioning'),
  }
}
