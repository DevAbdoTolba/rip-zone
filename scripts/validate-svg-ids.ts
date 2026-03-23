import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'

// ---- Muscle view mappings ----

// Muscles visible from front view (base svgRegion values from muscles.json)
const FRONT_MUSCLES: string[] = [
  'muscle-pectoralis-major', 'muscle-serratus-anterior',
  'muscle-anterior-deltoid', 'muscle-lateral-deltoid',
  'muscle-biceps-brachii', 'muscle-brachialis', 'muscle-coracobrachialis',
  'muscle-brachioradialis', 'muscle-wrist-flexors', 'muscle-pronator-teres',
  'muscle-rectus-abdominis', 'muscle-external-obliques', 'muscle-hip-flexors',
  'muscle-quadriceps-rectus-femoris', 'muscle-quadriceps-vastus-lateralis',
  'muscle-quadriceps-vastus-medialis', 'muscle-quadriceps-vastus-intermedius',
  'muscle-adductors', 'muscle-abductors', 'muscle-tensor-fasciae-latae',
  'muscle-sartorius', 'muscle-tibialis-anterior', 'muscle-gastrocnemius',
  'muscle-internal-obliques', 'muscle-transverse-abdominis', 'muscle-pectoralis-minor',
]

// Muscles visible from back view (base svgRegion values from muscles.json)
const BACK_MUSCLES: string[] = [
  'muscle-latissimus-dorsi', 'muscle-trapezius-upper', 'muscle-trapezius-middle',
  'muscle-trapezius-lower', 'muscle-rhomboids', 'muscle-erector-spinae',
  'muscle-teres-major', 'muscle-teres-minor', 'muscle-infraspinatus',
  'muscle-posterior-deltoid', 'muscle-supraspinatus', 'muscle-rotator-cuff',
  'muscle-triceps-long-head', 'muscle-triceps-lateral-head', 'muscle-triceps-medial-head',
  'muscle-wrist-extensors', 'muscle-lower-back',
  'muscle-gluteus-maximus', 'muscle-gluteus-medius', 'muscle-gluteus-minimus', 'muscle-piriformis',
  'muscle-hamstrings-biceps-femoris', 'muscle-hamstrings-semitendinosus',
  'muscle-hamstrings-semimembranosus', 'muscle-popliteus',
  'muscle-gastrocnemius', 'muscle-soleus',
]

// ---- Normal mode required IDs ----
// Uses grouped paths — representative path from each muscle group
const NORMAL_FRONT_REQUIRED: string[] = [
  'muscle-pectoralis-major', 'muscle-anterior-deltoid', 'muscle-lateral-deltoid',
  'muscle-biceps-brachii', 'muscle-brachialis', 'muscle-brachioradialis',
  'muscle-wrist-flexors', 'muscle-rectus-abdominis', 'muscle-external-obliques',
  'muscle-hip-flexors', 'muscle-serratus-anterior',
  'muscle-quadriceps-rectus-femoris', 'muscle-quadriceps-vastus-lateralis',
  'muscle-quadriceps-vastus-medialis', 'muscle-adductors', 'muscle-sartorius',
  'muscle-tibialis-anterior', 'muscle-gastrocnemius',
]

const NORMAL_BACK_REQUIRED: string[] = [
  'muscle-trapezius-upper', 'muscle-trapezius-middle', 'muscle-trapezius-lower',
  'muscle-posterior-deltoid', 'muscle-latissimus-dorsi', 'muscle-rhomboids',
  'muscle-teres-major', 'muscle-infraspinatus', 'muscle-erector-spinae',
  'muscle-triceps-long-head', 'muscle-wrist-extensors', 'muscle-lower-back',
  'muscle-gluteus-maximus', 'muscle-gluteus-medius',
  'muscle-hamstrings-biceps-femoris', 'muscle-hamstrings-semitendinosus',
  'muscle-gastrocnemius', 'muscle-soleus',
]

// ---- Advanced mode required IDs ----
// Uses individual muscle head paths (biceps long/short, triceps heads, quad heads, etc.)
// Also includes extra muscles not in Normal (coracobrachialis, pronator-teres, etc.)
const ADVANCED_FRONT_REQUIRED: string[] = [
  // Shoulders
  'muscle-anterior-deltoid', 'muscle-lateral-deltoid',
  // Chest
  'muscle-pectoralis-major', 'muscle-pectoralis-minor', 'muscle-serratus-anterior',
  // Biceps split into individual heads
  'muscle-biceps-long-head', 'muscle-biceps-short-head',
  // Arms
  'muscle-coracobrachialis', 'muscle-brachialis', 'muscle-brachioradialis',
  'muscle-pronator-teres', 'muscle-wrist-flexors',
  // Core
  'muscle-rectus-abdominis', 'muscle-external-obliques',
  'muscle-internal-obliques', 'muscle-transverse-abdominis', 'muscle-hip-flexors',
  // Hip
  'muscle-tensor-fasciae-latae',
  // Quads — individual heads
  'muscle-quadriceps-rectus-femoris', 'muscle-quadriceps-vastus-lateralis',
  'muscle-quadriceps-vastus-medialis', 'muscle-quadriceps-vastus-intermedius',
  // Thigh
  'muscle-abductors', 'muscle-adductors', 'muscle-sartorius',
  // Lower leg
  'muscle-tibialis-anterior', 'muscle-gastrocnemius',
]

const ADVANCED_BACK_REQUIRED: string[] = [
  // Traps
  'muscle-trapezius-upper', 'muscle-trapezius-middle', 'muscle-trapezius-lower',
  // Shoulders/rotator cuff
  'muscle-posterior-deltoid', 'muscle-supraspinatus', 'muscle-infraspinatus',
  'muscle-teres-minor', 'muscle-rotator-cuff',
  // Back
  'muscle-teres-major', 'muscle-rhomboids', 'muscle-latissimus-dorsi',
  'muscle-erector-spinae', 'muscle-lower-back',
  // Triceps — individual heads
  'muscle-triceps-long-head', 'muscle-triceps-lateral-head', 'muscle-triceps-medial-head',
  // Forearms
  'muscle-wrist-extensors',
  // Glutes
  'muscle-gluteus-maximus', 'muscle-gluteus-medius',
  'muscle-gluteus-minimus', 'muscle-piriformis',
  // Hamstrings — individual heads
  'muscle-hamstrings-biceps-femoris', 'muscle-hamstrings-semitendinosus',
  'muscle-hamstrings-semimembranosus',
  // Lower leg
  'muscle-popliteus', 'muscle-gastrocnemius', 'muscle-soleus',
]

// ---- Anatomy mode required IDs ----
// Splits bilateral muscles into -left / -right variants.
// Midline muscles keep their base ID.
const ANATOMY_FRONT_REQUIRED: string[] = [
  // Shoulders — bilateral
  'muscle-anterior-deltoid-left', 'muscle-anterior-deltoid-right',
  'muscle-lateral-deltoid-left', 'muscle-lateral-deltoid-right',
  // Chest — bilateral
  'muscle-pectoralis-major-left', 'muscle-pectoralis-major-right',
  'muscle-pectoralis-minor-left', 'muscle-pectoralis-minor-right',
  'muscle-serratus-anterior-left', 'muscle-serratus-anterior-right',
  // Biceps — bilateral (combined and/or individual heads)
  'muscle-biceps-brachii-left', 'muscle-biceps-brachii-right',
  // Arms — bilateral
  'muscle-coracobrachialis-left', 'muscle-coracobrachialis-right',
  'muscle-brachialis-left', 'muscle-brachialis-right',
  'muscle-brachioradialis-left', 'muscle-brachioradialis-right',
  'muscle-pronator-teres-left', 'muscle-pronator-teres-right',
  'muscle-wrist-flexors-left', 'muscle-wrist-flexors-right',
  // Core — midline (no left/right)
  'muscle-rectus-abdominis', 'muscle-external-obliques', 'muscle-hip-flexors',
  // Core — bilateral
  'muscle-internal-obliques-left', 'muscle-internal-obliques-right',
  'muscle-transverse-abdominis-left', 'muscle-transverse-abdominis-right',
  // Hip — bilateral
  'muscle-tensor-fasciae-latae-left', 'muscle-tensor-fasciae-latae-right',
  // Quads — bilateral
  'muscle-quadriceps-rectus-femoris-left', 'muscle-quadriceps-rectus-femoris-right',
  'muscle-quadriceps-vastus-lateralis-left', 'muscle-quadriceps-vastus-lateralis-right',
  'muscle-quadriceps-vastus-medialis-left', 'muscle-quadriceps-vastus-medialis-right',
  'muscle-quadriceps-vastus-intermedius-left', 'muscle-quadriceps-vastus-intermedius-right',
  // Thigh — bilateral
  'muscle-abductors-left', 'muscle-abductors-right',
  'muscle-adductors-left', 'muscle-adductors-right',
  'muscle-sartorius-left', 'muscle-sartorius-right',
  // Lower leg — bilateral
  'muscle-tibialis-anterior-left', 'muscle-tibialis-anterior-right',
  'muscle-gastrocnemius-left', 'muscle-gastrocnemius-right',
]

const ANATOMY_BACK_REQUIRED: string[] = [
  // Traps — midline
  'muscle-trapezius-upper', 'muscle-trapezius-middle', 'muscle-trapezius-lower',
  // Shoulders — bilateral
  'muscle-posterior-deltoid-left', 'muscle-posterior-deltoid-right',
  'muscle-supraspinatus-left', 'muscle-supraspinatus-right',
  'muscle-infraspinatus-left', 'muscle-infraspinatus-right',
  'muscle-teres-minor-left', 'muscle-teres-minor-right',
  'muscle-rotator-cuff-left', 'muscle-rotator-cuff-right',
  // Back — bilateral
  'muscle-teres-major-left', 'muscle-teres-major-right',
  'muscle-latissimus-dorsi-left', 'muscle-latissimus-dorsi-right',
  // Back — midline
  'muscle-rhomboids', 'muscle-erector-spinae', 'muscle-lower-back',
  // Triceps — bilateral
  'muscle-triceps-long-head-left', 'muscle-triceps-long-head-right',
  'muscle-triceps-lateral-head-left', 'muscle-triceps-lateral-head-right',
  'muscle-triceps-medial-head-left', 'muscle-triceps-medial-head-right',
  // Forearms — bilateral
  'muscle-wrist-extensors-left', 'muscle-wrist-extensors-right',
  // Glutes — bilateral
  'muscle-gluteus-maximus-left', 'muscle-gluteus-maximus-right',
  'muscle-gluteus-medius-left', 'muscle-gluteus-medius-right',
  'muscle-gluteus-minimus-left', 'muscle-gluteus-minimus-right',
  'muscle-piriformis-left', 'muscle-piriformis-right',
  // Hamstrings — bilateral
  'muscle-hamstrings-biceps-femoris-left', 'muscle-hamstrings-biceps-femoris-right',
  'muscle-hamstrings-semitendinosus-left', 'muscle-hamstrings-semitendinosus-right',
  'muscle-hamstrings-semimembranosus-left', 'muscle-hamstrings-semimembranosus-right',
  // Lower leg — bilateral
  'muscle-gastrocnemius-left', 'muscle-gastrocnemius-right',
  'muscle-soleus-left', 'muscle-soleus-right',
  'muscle-popliteus-left', 'muscle-popliteus-right',
]

// ---- Helper functions ----

/**
 * Extract all id="muscle-..." values from SVG content
 */
function extractMuscleIds(svgContent: string): string[] {
  const matches = svgContent.matchAll(/id="(muscle-[^"]+)"/g)
  return [...matches].map((m) => m[1])
}

/**
 * Extract all id="hit-muscle-..." values from SVG content
 */
function extractHitIds(svgContent: string): string[] {
  const matches = svgContent.matchAll(/id="(hit-muscle-[^"]+)"/g)
  return [...matches].map((m) => m[1])
}

/**
 * Build the set of known valid IDs for a given mode.
 * - Normal: base svgRegion values only
 * - Advanced: base values + head suffixes (long-head, short-head, etc.)
 * - Anatomy: base values + -left/-right suffixes + head suffixes with -left/-right
 */
function buildKnownIdsForMode(
  allSvgRegions: Set<string>,
  mode: 'normal' | 'advanced' | 'anatomy',
): Set<string> {
  const known = new Set<string>(allSvgRegions)

  if (mode === 'normal') {
    return known
  }

  if (mode === 'advanced') {
    // Advanced adds head suffixes to base IDs
    // Also allows the compound IDs in muscles.json (biceps-long-head, etc. are already in muscles.json)
    return known
  }

  if (mode === 'anatomy') {
    // Anatomy adds -left / -right to every base ID
    for (const id of allSvgRegions) {
      known.add(`${id}-left`)
      known.add(`${id}-right`)
    }
    // Also allow advanced-mode head IDs with -left/-right
    // (biceps-long-head-left, etc.)
    return known
  }

  return known
}

/**
 * Check SVG file against required muscle IDs and report results.
 * Returns true if all required IDs are present and all have hit-layer counterparts.
 */
function validateSvgFile(
  svgPath: string,
  requiredMuscleIds: string[],
  label: string,
  knownIds: Set<string>,
): boolean {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Validating: ${label}`)
  console.log(`File: ${svgPath}`)
  console.log('='.repeat(60))

  if (!existsSync(svgPath)) {
    console.error(`  ERROR: File not found: ${svgPath}`)
    return false
  }

  const svgContent = readFileSync(svgPath, 'utf-8')
  const foundMuscleIds = extractMuscleIds(svgContent)
  const foundHitIds = extractHitIds(svgContent)

  // Build sets for fast lookup
  const foundMuscleSet = new Set(foundMuscleIds)
  const foundHitSet = new Set(foundHitIds)

  // Check 1: Every required muscle ID exists
  const missingMuscleIds = requiredMuscleIds.filter((id) => !foundMuscleSet.has(id))

  // Check 2: Every required visual muscle path has a corresponding hit-layer path
  const missingHitIds = requiredMuscleIds
    .filter((id) => foundMuscleSet.has(id))
    .map((id) => `hit-${id}`)
    .filter((hitId) => !foundHitSet.has(hitId))

  // Check 3: No IDs that can't be traced back to known muscle IDs
  const extraIds = foundMuscleIds.filter((id) => !knownIds.has(id))

  // Report summary counts
  const totalFound = foundMuscleIds.length
  const totalRequired = requiredMuscleIds.length
  const totalMissing = missingMuscleIds.length
  const totalExtra = extraIds.length
  console.log(
    `\n[${label}] ${totalFound}/${totalRequired} paths found, ${totalMissing} missing, ${totalExtra} extra`,
  )

  // Report missing IDs
  if (missingMuscleIds.length > 0) {
    console.log(`\nMissing required muscle IDs (${missingMuscleIds.length}):`)
    missingMuscleIds.forEach((id) => console.log(`  MISSING: ${id}`))
  } else {
    console.log(`All ${requiredMuscleIds.length} required muscle IDs found.`)
  }

  // Report missing hit targets
  if (missingHitIds.length > 0) {
    console.log(`\nMissing hit-layer paths (${missingHitIds.length}):`)
    missingHitIds.forEach((id) => console.log(`  MISSING HIT: ${id}`))
  } else {
    console.log(`All required muscle paths have corresponding hit-layer paths.`)
  }

  // Report extra IDs
  if (extraIds.length > 0) {
    console.log(`\nExtra/unknown IDs (not traceable to muscles.json) (${extraIds.length}):`)
    extraIds.forEach((id) => console.log(`  EXTRA: ${id}`))
  } else {
    console.log(`No unexpected muscle IDs found.`)
  }

  const passed = missingMuscleIds.length === 0 && missingHitIds.length === 0 && extraIds.length === 0
  console.log(`\nResult: ${passed ? 'PASS' : 'FAIL'}`)
  return passed
}

// ---- Main validation ----

function main(): void {
  const cwd = process.cwd()

  // Load muscles.json to verify all svgRegion values
  const musclesPath = path.resolve(cwd, 'data/muscles.json')
  if (!existsSync(musclesPath)) {
    console.error(`ERROR: data/muscles.json not found at ${musclesPath}`)
    process.exit(1)
  }

  const muscles = JSON.parse(readFileSync(musclesPath, 'utf-8')) as Array<{
    slug: string
    displayName: string
    group: string
    svgRegion: string
  }>

  const allSvgRegions = new Set(muscles.map((m) => m.svgRegion))

  console.log(`Loaded ${muscles.length} muscles from data/muscles.json`)
  console.log(`Total unique svgRegion values: ${allSvgRegions.size}`)

  // Build known ID sets for each mode
  const normalKnown = buildKnownIdsForMode(allSvgRegions, 'normal')
  const advancedKnown = buildKnownIdsForMode(allSvgRegions, 'advanced')
  const anatomyKnown = buildKnownIdsForMode(allSvgRegions, 'anatomy')

  // Validate that required IDs in Normal mode are all in muscles.json
  const normalAllRequired = [...new Set([...NORMAL_FRONT_REQUIRED, ...NORMAL_BACK_REQUIRED])]
  const unknownNormalRequired = normalAllRequired.filter((id) => !allSvgRegions.has(id))
  if (unknownNormalRequired.length > 0) {
    console.error('\nWARNING: Normal required IDs not found in muscles.json svgRegion values:')
    unknownNormalRequired.forEach((id) => console.error(`  ${id}`))
  }

  // Discover all SVG files in src/assets/svg/
  const svgDir = path.resolve(cwd, 'src/assets/svg')
  if (!existsSync(svgDir)) {
    console.error(`\nERROR: SVG directory not found: ${svgDir}`)
    process.exit(1)
  }

  const svgFiles = readdirSync(svgDir).filter((f) => f.endsWith('.svg'))
  console.log(`\nFound ${svgFiles.length} SVG file(s) in src/assets/svg/:`)
  svgFiles.forEach((f) => console.log(`  ${f}`))

  // Validate all 6 SVG files
  const results: boolean[] = []

  // Normal mode
  const normalFrontPath = path.resolve(svgDir, 'muscle-map-normal-front.svg')
  results.push(validateSvgFile(normalFrontPath, NORMAL_FRONT_REQUIRED, 'Normal Front', normalKnown))

  const normalBackPath = path.resolve(svgDir, 'muscle-map-normal-back.svg')
  results.push(validateSvgFile(normalBackPath, NORMAL_BACK_REQUIRED, 'Normal Back', normalKnown))

  // Advanced mode
  const advancedFrontPath = path.resolve(svgDir, 'muscle-map-advanced-front.svg')
  results.push(
    validateSvgFile(advancedFrontPath, ADVANCED_FRONT_REQUIRED, 'Advanced Front', advancedKnown),
  )

  const advancedBackPath = path.resolve(svgDir, 'muscle-map-advanced-back.svg')
  results.push(
    validateSvgFile(advancedBackPath, ADVANCED_BACK_REQUIRED, 'Advanced Back', advancedKnown),
  )

  // Anatomy mode
  const anatomyFrontPath = path.resolve(svgDir, 'muscle-map-anatomy-front.svg')
  results.push(
    validateSvgFile(anatomyFrontPath, ANATOMY_FRONT_REQUIRED, 'Anatomy Front', anatomyKnown),
  )

  const anatomyBackPath = path.resolve(svgDir, 'muscle-map-anatomy-back.svg')
  results.push(
    validateSvgFile(anatomyBackPath, ANATOMY_BACK_REQUIRED, 'Anatomy Back', anatomyKnown),
  )

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60))
  const passed = results.every(Boolean)
  const passCount = results.filter(Boolean).length
  const labels = [
    'Normal Front',
    'Normal Back',
    'Advanced Front',
    'Advanced Back',
    'Anatomy Front',
    'Anatomy Back',
  ]
  labels.forEach((label, i) => {
    console.log(`  ${results[i] ? 'PASS' : 'FAIL'} — ${label}`)
  })
  console.log(`\nChecks: ${passCount}/${results.length} passed`)
  console.log(
    `Overall: ${passed ? 'PASS - All 6 SVG files validated successfully' : 'FAIL - Some validations failed'}`,
  )

  process.exit(passed ? 0 : 1)
}

main()
