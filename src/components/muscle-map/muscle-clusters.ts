import type { MuscleSlug } from '@/types'
import type { ZoomRegion } from '@/stores/useMapStore'

// Map from hit-target path ID to the cluster it belongs to.
// When a user taps a hit target whose ID is a key in this map,
// disambiguation zoom triggers (in Advanced/Anatomy modes only).
// IMPORTANT: Only populated for muscles that actually overlap/cluster
// in the SVG layout. Most muscles resolve directly to selectMuscle().

export const CLUSTER_MAP: Record<string, ZoomRegion> = {
  // Rotator cuff cluster (back view — supraspinatus, infraspinatus, teres-minor overlap)
  'hit-muscle-supraspinatus': {
    muscles: ['supraspinatus' as MuscleSlug, 'infraspinatus' as MuscleSlug, 'teres-minor' as MuscleSlug, 'rotator-cuff' as MuscleSlug],
    viewBox: '15 22 70 25',
    label: 'Rotator Cuff',
  },
  'hit-muscle-infraspinatus': {
    muscles: ['supraspinatus' as MuscleSlug, 'infraspinatus' as MuscleSlug, 'teres-minor' as MuscleSlug, 'rotator-cuff' as MuscleSlug],
    viewBox: '15 22 70 25',
    label: 'Rotator Cuff',
  },
  'hit-muscle-teres-minor': {
    muscles: ['supraspinatus' as MuscleSlug, 'infraspinatus' as MuscleSlug, 'teres-minor' as MuscleSlug, 'rotator-cuff' as MuscleSlug],
    viewBox: '15 22 70 25',
    label: 'Rotator Cuff',
  },
  'hit-muscle-rotator-cuff': {
    muscles: ['supraspinatus' as MuscleSlug, 'infraspinatus' as MuscleSlug, 'teres-minor' as MuscleSlug, 'rotator-cuff' as MuscleSlug],
    viewBox: '15 22 70 25',
    label: 'Rotator Cuff',
  },
  // Deep glute cluster (back view — piriformis, gluteus-minimus under gluteus-maximus)
  'hit-muscle-piriformis': {
    muscles: ['gluteus-maximus' as MuscleSlug, 'gluteus-medius' as MuscleSlug, 'gluteus-minimus' as MuscleSlug, 'piriformis' as MuscleSlug],
    viewBox: '22 66 56 30',
    label: 'Glute Complex',
  },
  'hit-muscle-gluteus-minimus': {
    muscles: ['gluteus-maximus' as MuscleSlug, 'gluteus-medius' as MuscleSlug, 'gluteus-minimus' as MuscleSlug, 'piriformis' as MuscleSlug],
    viewBox: '22 66 56 30',
    label: 'Glute Complex',
  },
  // Behind-knee cluster (back view — popliteus is tiny, behind hamstrings insertion)
  'hit-muscle-popliteus': {
    muscles: ['hamstrings-biceps-femoris' as MuscleSlug, 'hamstrings-semitendinosus' as MuscleSlug, 'popliteus' as MuscleSlug],
    viewBox: '26 118 48 22',
    label: 'Posterior Knee',
  },
}

// Display names for muscles — used in zoomed cluster view labels (D-18)
// Maps MuscleSlug to human-readable name
export const MUSCLE_DISPLAY_NAMES: Record<string, string> = {
  'supraspinatus': 'Supraspinatus',
  'infraspinatus': 'Infraspinatus',
  'teres-minor': 'Teres Minor',
  'teres-major': 'Teres Major',
  'rotator-cuff': 'Rotator Cuff',
  'gluteus-maximus': 'Glute Max',
  'gluteus-medius': 'Glute Med',
  'gluteus-minimus': 'Glute Min',
  'piriformis': 'Piriformis',
  'brachioradialis': 'Brachioradialis',
  'wrist-flexors': 'Wrist Flexors',
  'pronator-teres': 'Pronator Teres',
  'hamstrings-biceps-femoris': 'Biceps Femoris',
  'hamstrings-semitendinosus': 'Semitendinosus',
  'popliteus': 'Popliteus',
}

// Centroid coordinates (x, y) in SVG coordinate space for each labelable muscle.
// These positions correspond to the center of each muscle path where the text label
// will be placed during disambiguation zoom.
// Coordinates derived from SVG path positions in the advanced-back SVG (viewBox 0 0 100 250).
export const MUSCLE_CENTROIDS: Record<string, { x: number; y: number }> = {
  // Rotator cuff cluster — back view upper shoulder area
  'supraspinatus': { x: 50, y: 30 },
  'infraspinatus': { x: 50, y: 38 },
  'teres-minor': { x: 50, y: 41 },
  'rotator-cuff': { x: 50, y: 39 },
  // Glute cluster — back view buttock area
  'gluteus-maximus': { x: 50, y: 85 },
  'gluteus-medius': { x: 50, y: 77 },
  'gluteus-minimus': { x: 50, y: 76 },
  'piriformis': { x: 50, y: 87 },
  // Forearm muscles (front view)
  'brachioradialis': { x: 17, y: 60 },
  'wrist-flexors': { x: 18, y: 66 },
  'pronator-teres': { x: 16, y: 63 },
  // Posterior knee cluster (back view)
  'hamstrings-biceps-femoris': { x: 34, y: 125 },
  'hamstrings-semitendinosus': { x: 46, y: 125 },
  'popliteus': { x: 50, y: 131 },
}
