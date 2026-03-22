import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'
import { readFileSync } from 'fs'

// Load .env.local for MONGODB_URI
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI not set — check .env.local')
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  // Import models (they register themselves via side-effect)
  const { default: Muscle } = await import('../src/models/Muscle')
  const { default: Exercise } = await import('../src/models/Exercise')
  const { default: WorkoutPlan } = await import('../src/models/WorkoutPlan')
  const { default: FaqEntry } = await import('../src/models/FaqEntry')

  // Load JSON data
  const musclesData = JSON.parse(readFileSync(path.resolve(process.cwd(), 'data/muscles.json'), 'utf-8'))
  const exercisesData = JSON.parse(readFileSync(path.resolve(process.cwd(), 'data/exercises.json'), 'utf-8'))
  const workoutPlansData = JSON.parse(readFileSync(path.resolve(process.cwd(), 'data/workout-plans.json'), 'utf-8'))
  const faqData = JSON.parse(readFileSync(path.resolve(process.cwd(), 'data/faq-entries.json'), 'utf-8'))

  // Clear and re-seed each collection
  await Muscle.deleteMany({})
  await Muscle.insertMany(musclesData)
  console.log(`Seeded ${musclesData.length} muscles`)

  await Exercise.deleteMany({})
  await Exercise.insertMany(exercisesData)
  console.log(`Seeded ${exercisesData.length} exercises`)

  await WorkoutPlan.deleteMany({})
  await WorkoutPlan.insertMany(workoutPlansData)
  console.log(`Seeded ${workoutPlansData.length} workout plans`)

  await FaqEntry.deleteMany({})
  await FaqEntry.insertMany(faqData)
  console.log(`Seeded ${faqData.length} FAQ entries`)

  await mongoose.disconnect()
  console.log('Seeding complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
