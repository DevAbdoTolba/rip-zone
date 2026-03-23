'use client'

import { useState } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { Tabs } from '@base-ui/react/tabs'
import { Search } from 'lucide-react'
import type { Exercise } from '@/types/workout'
import { filterExercises } from '@/lib/exercise-filter'

interface ExercisePickerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercises: Exercise[]
  onSelectExercise: (exercise: Exercise) => void
}

const MUSCLE_TABS = [
  { value: 'recent', label: 'Recent' },
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
]

// Muscle group to slug mapping (primaryMuscles may contain these slugs)
const MUSCLE_GROUP_SLUGS: Record<string, string[]> = {
  chest: ['pectoralis-major', 'pectoralis-minor'],
  back: ['latissimus-dorsi', 'rhomboids', 'trapezius', 'middle-trapezius', 'lower-trapezius', 'teres-major', 'teres-minor', 'lower-back', 'erector-spinae'],
  shoulders: ['anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid', 'deltoid'],
  arms: ['biceps-long-head', 'biceps-short-head', 'triceps-long-head', 'triceps-lateral-head', 'triceps-medial-head', 'brachialis', 'brachioradialis'],
  legs: ['quadriceps', 'rectus-femoris', 'vastus-lateralis', 'vastus-medialis', 'vastus-intermedius', 'hamstrings', 'biceps-femoris', 'semitendinosus', 'semimembranosus', 'hip-flexors', 'adductors'],
  core: ['rectus-abdominis', 'external-obliques', 'internal-obliques', 'transverse-abdominis'],
}

function getMuscleDisplay(primaryMuscles: string[]): string {
  return primaryMuscles
    .map(m => m.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .slice(0, 2)
    .join(', ')
}

export function ExercisePickerSheet({
  open,
  onOpenChange,
  exercises,
  onSelectExercise,
}: ExercisePickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise)
    onOpenChange(false)
  }

  const getFilteredExercises = () => {
    if (activeTab === 'recent') {
      // Placeholder: show first 10 exercises
      const base = exercises.slice(0, 10)
      if (!searchQuery) return base
      return filterExercises({ exercises: base as any, query: searchQuery }) as unknown as Exercise[]
    }

    if (activeTab === 'all') {
      if (!searchQuery) return exercises
      return filterExercises({ exercises: exercises as any, query: searchQuery }) as unknown as Exercise[]
    }

    // Muscle group tab
    const slugs = MUSCLE_GROUP_SLUGS[activeTab] ?? []
    const muscleFiltered = exercises.filter(ex =>
      ex.primaryMuscles.some(m => slugs.includes(m as string))
    )
    if (!searchQuery) return muscleFiltered
    return filterExercises({ exercises: muscleFiltered as any, query: searchQuery }) as unknown as Exercise[]
  }

  const filteredExercises = getFilteredExercises()

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
        <Drawer.Popup className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col outline-none">
          <Drawer.Title className="sr-only">Pick an exercise</Drawer.Title>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3 flex-shrink-0">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Muscle group tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as string)}
            className="flex flex-col min-h-0 flex-1"
          >
            <Tabs.List className="flex gap-1 px-4 pb-2 overflow-x-auto flex-shrink-0 scrollbar-none">
              {MUSCLE_TABS.map(tab => (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors text-muted-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground hover:text-foreground"
                >
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {/* Exercise list - shared panel for all tabs */}
            {MUSCLE_TABS.map(tab => (
              <Tabs.Panel
                key={tab.value}
                value={tab.value}
                className="flex-1 overflow-y-auto px-4 pb-6"
              >
                {filteredExercises.length === 0 ? (
                  <p className="text-center text-muted-foreground text-[14px] py-8">
                    No exercises found
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filteredExercises.map(exercise => (
                      <li key={exercise.slug as string}>
                        <button
                          onClick={() => handleSelect(exercise)}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-[14px] font-medium text-foreground">
                            {exercise.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            {getMuscleDisplay(exercise.primaryMuscles as string[])}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Tabs.Panel>
            ))}
          </Tabs.Root>
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
