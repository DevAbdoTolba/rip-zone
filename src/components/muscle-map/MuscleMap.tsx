'use client'

import { MuscleMapControls } from './MuscleMapControls'
import { MuscleMapCanvas } from './MuscleMapCanvas'

export function MuscleMap() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <MuscleMapControls />
      <MuscleMapCanvas />
    </div>
  )
}
