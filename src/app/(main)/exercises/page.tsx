import { Suspense } from 'react'
import { ExerciseLibrary } from '@/components/exercise-library/ExerciseLibrary'
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground text-[16px]">Loading exercises...</div>}>
      <ExerciseLibrary
        exercises={exercisesData}
        muscles={musclesData}
        warmups={warmupsData}
      />
    </Suspense>
  )
}
