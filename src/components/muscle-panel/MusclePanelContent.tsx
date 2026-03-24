'use client'

import { useMemo } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { X } from 'lucide-react'
import { StrainLevel } from '@/types'
import type { MuscleSlug } from '@/types'
import { StrainStatusCard } from './StrainStatusCard'
import { PanelExerciseList } from './PanelExerciseList'
import { PanelWarmupSection } from './PanelWarmupSection'

interface ExerciseJSON {
  slug: string
  name: string
  description: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: string
  difficulty: string
  formCues: string[]
}

interface MuscleJSON {
  slug: string
  displayName: string
  group: string
  svgRegion: string
}

interface WarmupJSON {
  muscleGroup: string
  movements: { name: string; instruction: string; duration: string }[]
}

interface MusclePanelContentProps {
  selectedMuscle: string
  exercises: ExerciseJSON[]
  muscles: MuscleJSON[]
  warmups: WarmupJSON[]
  strainMap: Map<MuscleSlug, StrainLevel>
}

export function MusclePanelContent({
  selectedMuscle,
  exercises,
  muscles,
  warmups,
  strainMap,
}: MusclePanelContentProps) {
  const muscleData = useMemo(
    () => muscles.find(m => m.slug === selectedMuscle),
    [muscles, selectedMuscle]
  )

  const level = strainMap.get(selectedMuscle as MuscleSlug) ?? StrainLevel.Rested
  const muscleGroup = muscleData?.group

  return (
    <div data-testid="muscle-panel-content" className="flex-1 overflow-y-auto">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <Drawer.Title className="text-[20px] font-semibold text-foreground">
          {muscleData?.displayName ?? selectedMuscle}
        </Drawer.Title>
        <Drawer.Close
          className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close muscle panel"
        >
          <X size={20} className="text-muted-foreground" />
        </Drawer.Close>
      </div>

      {/* Strain status card */}
      <div className="px-4 py-3">
        <StrainStatusCard level={level} />
      </div>

      {/* Exercise list */}
      <div className="px-4 py-3">
        <PanelExerciseList
          exercises={exercises}
          selectedMuscle={selectedMuscle}
          muscles={muscles}
        />
      </div>

      {/* Warmup section */}
      <div className="px-4 pb-4">
        <PanelWarmupSection muscleGroup={muscleGroup} warmups={warmups} />
      </div>
    </div>
  )
}
