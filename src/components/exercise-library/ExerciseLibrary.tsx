'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseCard } from './ExerciseCard'
import { filterExercises } from '@/lib/exercise-filter'
import { cn } from '@/lib/utils'

const MUSCLE_GROUP_ORDER = ['chest', 'back', 'shoulders', 'arms', 'forearms', 'core', 'legs', 'glutes', 'calves']

const GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  forearms: 'Forearms',
  core: 'Core',
  legs: 'Legs',
  glutes: 'Glutes',
  calves: 'Calves',
}

interface Exercise {
  slug: string
  name: string
  description: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: string
  difficulty: string
  formCues: string[]
}

interface Muscle {
  slug: string
  displayName: string
  group: string
  svgRegion: string
}

interface WarmupMovement {
  name: string
  instruction: string
  duration: string
}

interface Warmup {
  muscleGroup: string
  movements: WarmupMovement[]
}

interface ExerciseLibraryProps {
  exercises: Exercise[]
  muscles: Muscle[]
  warmups: Warmup[]
}

export function ExerciseLibrary({ exercises, muscles, warmups }: ExerciseLibraryProps) {
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [equipment, setEquipment] = useState(() => searchParams.get('equipment') ?? '')
  const [difficulty, setDifficulty] = useState('')
  const [muscleFilter, setMuscleFilter] = useState(() => searchParams.get('muscle') ?? '')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(MUSCLE_GROUP_ORDER)
  )
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [level2Card, setLevel2Card] = useState<string | null>(null)
  const [warmupExercise, setWarmupExercise] = useState<Exercise | null>(null)

  const hasActiveFilter = query !== '' || equipment !== '' || difficulty !== '' || muscleFilter !== ''

  const filteredExercises = useMemo(() => {
    const base = filterExercises({ exercises, query, equipment, muscle: muscleFilter }) as Exercise[]
    return base.filter(ex => !difficulty || ex.difficulty === difficulty)
  }, [exercises, query, equipment, muscleFilter, difficulty])

  const groupedExercises = useMemo(() => {
    const map = new Map<string, Exercise[]>()
    for (const group of MUSCLE_GROUP_ORDER) {
      map.set(group, [])
    }
    for (const ex of filteredExercises) {
      const primaryMuscle = ex.primaryMuscles[0]
      const muscle = muscles.find(m => m.slug === primaryMuscle)
      const group = muscle?.group ?? 'other'
      if (map.has(group)) {
        map.get(group)!.push(ex)
      }
    }
    return map
  }, [filteredExercises, muscles])

  const muscleGroups = useMemo(() => {
    return muscles
      .filter((m, index, self) =>
        self.findIndex(other => other.group === m.group) === index
      )
      .map(m => ({ slug: m.group, displayName: GROUP_LABELS[m.group] ?? m.group }))
  }, [muscles])

  function toggleSection(group: string) {
    return () => {
      setExpandedSections(prev => {
        const next = new Set(prev)
        if (next.has(group)) {
          next.delete(group)
        } else {
          next.add(group)
        }
        return next
      })
    }
  }

  function toggleLevel1(slug: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
        // Also close level 2 if it was this card
        if (level2Card === slug) {
          setLevel2Card(null)
        }
      } else {
        next.add(slug)
      }
      return next
    })
  }

  function toggleLevel2(slug: string) {
    setLevel2Card(prev => prev === slug ? null : slug)
  }

  function openWarmup(ex: Exercise) {
    setWarmupExercise(ex)
  }

  function clearAllFilters() {
    setQuery('')
    setEquipment('')
    setDifficulty('')
    setMuscleFilter('')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background">
        <div className="px-8 pt-6 pb-2">
          <h1 className="text-[28px] font-semibold text-foreground mb-4">Exercises</h1>
        </div>
        <ExerciseFilters
          query={query}
          onQueryChange={setQuery}
          equipment={equipment}
          onEquipmentChange={setEquipment}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          muscleFilter={muscleFilter}
          onMuscleFilterChange={setMuscleFilter}
          muscleGroups={muscleGroups}
        />
      </div>

      {/* Muscle group sections */}
      <div className="px-8 py-4">
        {MUSCLE_GROUP_ORDER.map(group => {
          const groupExercises = groupedExercises.get(group)
          if (hasActiveFilter && (!groupExercises || groupExercises.length === 0)) return null
          const isExpanded = hasActiveFilter ? true : expandedSections.has(group)
          return (
            <section key={group} className="mb-12">
              <button
                onClick={toggleSection(group)}
                className="flex items-center justify-between w-full py-2"
                aria-expanded={isExpanded}
              >
                <h2 className="text-[20px] font-semibold text-foreground">{GROUP_LABELS[group]}</h2>
                <ChevronDown
                  className={cn('text-muted-foreground transition-transform', !isExpanded && 'rotate-180')}
                  size={20}
                />
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-3 mt-3">
                  {groupExercises?.map(ex => (
                    <ExerciseCard
                      key={ex.slug}
                      exercise={ex}
                      muscles={muscles}
                      warmups={warmups}
                      isLevel1={expandedCards.has(ex.slug)}
                      isLevel2={level2Card === ex.slug}
                      onToggleLevel1={() => toggleLevel1(ex.slug)}
                      onToggleLevel2={() => toggleLevel2(ex.slug)}
                      onOpenWarmup={() => openWarmup(ex)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* Empty state */}
        {filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img
              src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
              alt="Gym meme"
              className="w-48 h-48 object-cover rounded-lg mb-6 opacity-80"
            />
            <h3 className="text-[20px] font-semibold text-foreground mb-2">No exercises found, habibi</h3>
            <p className="text-[16px] text-muted-foreground mb-6 max-w-sm">
              Those filters are stricter than your gym bro&apos;s diet. Try clearing them — we&apos;ve got 110 exercises waiting.
            </p>
            <Button variant="default" onClick={clearAllFilters}>Clear filters</Button>
          </div>
        )}
      </div>

      {/* Warmup sheet placeholder - rendered by Plan 03 */}
      {warmupExercise && (
        <div
          data-testid="warmup-sheet"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80"
          onClick={() => setWarmupExercise(null)}
        >
          <div
            className="bg-card border border-border rounded-t-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[20px] font-semibold text-foreground mb-4">
              {GROUP_LABELS[
                muscles.find(m => m.slug === warmupExercise.primaryMuscles[0])?.group ?? ''
              ] ?? 'Warm-up'} Warm-up
            </h3>
            {(() => {
              const muscleGroup = muscles.find(m => m.slug === warmupExercise.primaryMuscles[0])?.group
              const warmup = warmups.find(w => w.muscleGroup === muscleGroup)
              return warmup?.movements.map((movement, i) => (
                <div key={i} data-testid="warmup-movement" className="mb-4">
                  <p className="text-[14px] font-semibold text-foreground">{movement.name}</p>
                  <p className="text-[16px] text-muted-foreground">{movement.instruction}</p>
                  <p className="text-[14px] text-muted-foreground">{movement.duration}</p>
                </div>
              ))
            })()}
            <Button variant="outline" onClick={() => setWarmupExercise(null)} className="w-full mt-2">Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
