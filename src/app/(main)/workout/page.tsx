'use client'

import exercisesData from '@/../data/exercises.json'
import { WorkoutLogger } from '@/components/workout/WorkoutLogger'
import type { Exercise } from '@/types/workout'

export default function WorkoutPage() {
  return (
    <main className="flex-1 pb-20">
      <WorkoutLogger exercises={exercisesData as unknown as Exercise[]} />
    </main>
  )
}
