import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'

// ---- Muscle view mappings ----

// Muscles visible from front view
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
]

// Muscles visible from back view
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

// Normal mode uses grouped paths — not every individual muscle needs its own path
// Only check that the "representative" path from each group exists
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
 * Check SVG file against required muscle IDs and report results.
 * Returns true if all checks pass, false otherwise.
 */
function validateSvgFile(
  svgPath: string,
  requiredMuscleIds: string[],
  label: string,
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
  // Check 2: Every visual muscle path has a corresponding hit-layer path
  const missingHitIds = foundMuscleIds
    .filter((id) => requiredMuscleIds.includes(id))
    .map((id) => `hit-${id}`)
    .filter((hitId) => !foundHitSet.has(hitId))
  // Check 3: No unexpected/typo IDs that don't match muscles.json svgRegion values
  const allKnownMuscleIds = new Set([...FRONT_MUSCLES, ...BACK_MUSCLES])
  const extraIds = foundMuscleIds.filter((id) => !allKnownMuscleIds.has(id))

  // Report found IDs
  console.log(`\nFound muscle IDs (${foundMuscleIds.length}):`)
  foundMuscleIds.forEach((id) => {
    const hasHit = foundHitSet.has(`hit-${id}`)
    const isRequired = requiredMuscleIds.includes(id)
    const status = isRequired ? (hasHit ? '  OK ' : ' MISS') : '  -- '
    console.log(`  [${status}] ${id}`)
  })

  // Report missing IDs
  if (missingMuscleIds.length > 0) {
    console.log(`\nMissing required muscle IDs (${missingMuscleIds.length}):`)
    missingMuscleIds.forEach((id) => console.log(`  MISSING: ${id}`))
  } else {
    console.log(`\nAll ${requiredMuscleIds.length} required muscle IDs found.`)
  }

  // Report missing hit targets
  if (missingHitIds.length > 0) {
    console.log(`\nMissing hit-layer paths (${missingHitIds.length}):`)
    missingHitIds.forEach((id) => console.log(`  MISSING HIT: ${id}`))
  } else {
    console.log(`All muscle paths have corresponding hit-layer paths.`)
  }

  // Report extra IDs
  if (extraIds.length > 0) {
    console.log(`\nExtra/unknown IDs (not in muscles.json) (${extraIds.length}):`)
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

  // Validate that our required IDs are all in muscles.json
  const allRequired = [...new Set([...NORMAL_FRONT_REQUIRED, ...NORMAL_BACK_REQUIRED])]
  const unknownRequired = allRequired.filter((id) => !allSvgRegions.has(id))
  if (unknownRequired.length > 0) {
    console.error('\nWARNING: Required IDs not found in muscles.json svgRegion values:')
    unknownRequired.forEach((id) => console.error(`  ${id}`))
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

  // Validate Normal mode files
  const results: boolean[] = []

  const normalFrontPath = path.resolve(svgDir, 'muscle-map-normal-front.svg')
  results.push(validateSvgFile(normalFrontPath, NORMAL_FRONT_REQUIRED, 'Normal Front View'))

  const normalBackPath = path.resolve(svgDir, 'muscle-map-normal-back.svg')
  results.push(validateSvgFile(normalBackPath, NORMAL_BACK_REQUIRED, 'Normal Back View'))

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60))
  const passed = results.every(Boolean)
  const passCount = results.filter(Boolean).length
  console.log(`Checks: ${passCount}/${results.length} passed`)
  console.log(`Overall: ${passed ? 'PASS - All validations passed' : 'FAIL - Some validations failed'}`)

  process.exit(passed ? 0 : 1)
}

main()
