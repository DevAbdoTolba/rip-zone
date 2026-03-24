'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'

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

interface PanelExerciseListProps {
  exercises: ExerciseJSON[]
  selectedMuscle: string
  muscles: MuscleJSON[]
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
  cable: 'Cable',
  kettlebell: 'Kettlebell',
  band: 'Band',
  other: 'Other',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function PanelExerciseList({ exercises, selectedMuscle, muscles: _muscles }: PanelExerciseListProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [showSecondary, setShowSecondary] = useState(false)

  useEffect(() => {
    setExpandedSlug(null)
    setShowSecondary(false)
  }, [selectedMuscle])

  const { primaryExercises, secondaryExercises } = useMemo(() => {
    const primary = exercises.filter(ex => ex.primaryMuscles.includes(selectedMuscle))
    const secondary = exercises.filter(
      ex => ex.secondaryMuscles.includes(selectedMuscle) && !ex.primaryMuscles.includes(selectedMuscle)
    )
    return { primaryExercises: primary, secondaryExercises: secondary }
  }, [exercises, selectedMuscle])

  function renderExerciseItem(ex: ExerciseJSON) {
    const isExpanded = expandedSlug === ex.slug
    return (
      <li
        key={ex.slug}
        className="min-h-[44px] cursor-pointer"
        onClick={() => setExpandedSlug(prev => prev === ex.slug ? null : ex.slug)}
      >
        <div className="flex items-center justify-between py-2">
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-normal text-foreground">{ex.name}</p>
            {isExpanded && (
              <p className="text-[14px] text-muted-foreground mt-1 line-clamp-2 animate-accordion-down">
                {ex.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-[14px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                {EQUIPMENT_LABELS[ex.equipment] ?? ex.equipment}
              </span>
              <span className="text-[14px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                {DIFFICULTY_LABELS[ex.difficulty] ?? ex.difficulty}
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown size={16} className="text-muted-foreground ml-2 flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground ml-2 flex-shrink-0" />
          )}
        </div>
      </li>
    )
  }

  return (
    <div data-testid="panel-exercise-list">
      <h3 className="text-[14px] font-semibold text-foreground mb-2">Exercises</h3>

      {primaryExercises.length === 0 ? (
        <p className="text-[14px] text-muted-foreground">No exercises found for this muscle group.</p>
      ) : (
        <ul className="space-y-2">
          {primaryExercises.map(ex => renderExerciseItem(ex))}
        </ul>
      )}

      <Link
        href={`/exercises?muscle=${selectedMuscle}`}
        className="text-primary text-[14px] font-normal inline-block mt-3"
      >
        View all exercises
      </Link>

      {secondaryExercises.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowSecondary(s => !s)}
            aria-expanded={showSecondary}
            className="flex items-center justify-between w-full py-3 min-h-[44px] text-[14px] font-semibold text-foreground"
          >
            Also targets this muscle
            {showSecondary ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {showSecondary && (
            <div className="animate-accordion-down">
              <ul className="space-y-2">
                {secondaryExercises.map(ex => renderExerciseItem(ex))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
