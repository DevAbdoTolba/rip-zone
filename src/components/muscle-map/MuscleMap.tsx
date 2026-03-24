'use client'

import { useEffect } from 'react'
import { MuscleMapControls } from './MuscleMapControls'
import { MuscleMapCanvas } from './MuscleMapCanvas'
import { useStrainMap } from '@/hooks/useStrainMap'
import { useProfileStore } from '@/stores/useProfileStore'
import { computeAccuracyPct } from '@/lib/bio-accuracy'
import { AccuracyRing } from '@/components/profile/AccuracyRing'

export function MuscleMap() {
  const strainMap = useStrainMap()
  const latestBio = useProfileStore(s => s.latestBio)

  useEffect(() => {
    useProfileStore.getState().loadLatestBio()
  }, [])

  const accuracyPct = computeAccuracyPct(latestBio)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <MuscleMapControls />
      <MuscleMapCanvas strainMap={strainMap} />
      <div className="flex items-center gap-3 justify-center">
        <AccuracyRing pct={accuracyPct} />
        <p className="text-[14px] text-muted-foreground text-center">
          Strain data based on placeholder estimates
        </p>
      </div>
    </div>
  )
}
