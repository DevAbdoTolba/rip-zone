import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    await connectToDatabase()

    // Dynamic imports to avoid model registration issues
    const { default: Muscle } = await import('@/models/Muscle')
    const { default: Exercise } = await import('@/models/Exercise')
    const { default: WorkoutPlan } = await import('@/models/WorkoutPlan')
    const { default: FaqEntry } = await import('@/models/FaqEntry')

    const [muscleCount, exerciseCount, planCount, faqCount] = await Promise.all([
      Muscle.countDocuments(),
      Exercise.countDocuments(),
      WorkoutPlan.countDocuments(),
      FaqEntry.countDocuments(),
    ])

    return NextResponse.json({
      mongodb: 'connected',
      seed: {
        muscles: muscleCount,
        exercises: exerciseCount,
        plans: planCount,
        faq: faqCount,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        mongodb: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
