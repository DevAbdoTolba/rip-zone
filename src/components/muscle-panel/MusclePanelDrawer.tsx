'use client'

import { useEffect } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { useMapStore } from '@/stores/useMapStore'
import { useStrainMap } from '@/hooks/useStrainMap'
import { cn } from '@/lib/utils'
import { MusclePanelContent } from './MusclePanelContent'

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

interface MusclePanelDrawerProps {
  exercises: ExerciseJSON[]
  muscles: MuscleJSON[]
  warmups: WarmupJSON[]
}

export function MusclePanelDrawer({ exercises, muscles, warmups }: MusclePanelDrawerProps) {
  const selectedMuscle = useMapStore(s => s.selectedMuscle)
  const currentView = useMapStore(s => s.currentView)
  const selectMuscle = useMapStore(s => s.selectMuscle)
  const strainMap = useStrainMap()
  const isOpen = selectedMuscle !== null

  // View toggle close effect — closes panel and deselects muscle when front/back view changes
  useEffect(() => {
    selectMuscle(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView])

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => { if (!open) selectMuscle(null) }}
      modal={false}
    >
      <Drawer.Portal>
        {/* Mobile-only backdrop */}
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80 md:hidden" />
        <Drawer.Popup
          data-testid="muscle-panel"
          className={cn(
            // Mobile: bottom sheet
            'fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl',
            'max-h-[85vh] flex flex-col outline-none',
            // Desktop: right-side drawer
            'md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[380px] md:max-h-none',
            'md:border-t-0 md:border-l md:rounded-none',
          )}
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-8 h-1 rounded-full bg-muted-foreground/40" />
          </div>

          {selectedMuscle && (
            <MusclePanelContent
              selectedMuscle={selectedMuscle}
              exercises={exercises}
              muscles={muscles}
              warmups={warmups}
              strainMap={strainMap}
            />
          )}
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
