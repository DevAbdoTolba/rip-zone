'use client'

import { MuscleMapControls } from './MuscleMapControls'
import { MuscleMapCanvas } from './MuscleMapCanvas'
import { useStrainMap } from '@/hooks/useStrainMap'

export function MuscleMap() {
  const strainMap = useStrainMap()

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <MuscleMapControls />
      <MuscleMapCanvas strainMap={strainMap} />
      <p className="text-[14px] text-muted-foreground text-center">
        Strain data based on placeholder estimates
      </p>
    </div>
  )
}
