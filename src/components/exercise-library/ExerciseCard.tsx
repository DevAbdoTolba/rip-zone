'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
  cable: 'Cable',
  kettlebell: 'Kettlebell',
  band: 'Resistance Band',
  other: 'Other',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

interface ExerciseCardProps {
  exercise: {
    slug: string
    name: string
    description: string
    primaryMuscles: string[]
    secondaryMuscles: string[]
    equipment: string
    difficulty: string
    formCues: string[]
  }
  muscles: Array<{ slug: string; displayName: string; group: string }>
  warmups: Array<{ muscleGroup: string; movements: Array<{ name: string; instruction: string; duration: string }> }>
  isLevel1: boolean
  isLevel2: boolean
  onToggleLevel1: () => void
  onToggleLevel2: () => void
  onOpenWarmup: () => void
}

export function ExerciseCard({
  exercise,
  muscles,
  isLevel1,
  isLevel2,
  onToggleLevel1,
  onToggleLevel2,
  onOpenWarmup,
}: ExerciseCardProps) {
  if (!isLevel1) {
    // Level 0: collapsed — show name + chevron only
    return (
      <div
        data-testid="exercise-card"
        className="bg-card border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={onToggleLevel1}
      >
        <div className="flex items-center justify-between">
          <span data-testid="exercise-name" className="text-[16px] font-normal text-foreground">
            {exercise.name}
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Level 1 (and optionally Level 2): expanded
  return (
    <div
      data-testid="exercise-card"
      className={cn(
        'bg-card border border-border rounded-lg px-4 py-3',
        'hover:border-primary/30 transition-colors'
      )}
    >
      {/* Header — always clickable to toggle level 1 */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleLevel1}
      >
        <span data-testid="exercise-name" className="text-[20px] font-semibold text-foreground">
          {exercise.name}
        </span>
        <ChevronDown size={16} className="text-muted-foreground" />
      </div>

      {/* Level 1 body */}
      <div className="animate-accordion-down mt-3">
        {/* Description */}
        <p className="text-[16px] text-muted-foreground line-clamp-2 mb-3">
          {exercise.description}
        </p>

        {/* Primary muscles */}
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.primaryMuscles.map(slug => {
            const muscle = muscles.find(m => m.slug === slug)
            return (
              <Badge key={slug} variant="outline" className="text-[14px]">
                {muscle?.displayName ?? slug}
              </Badge>
            )
          })}
        </div>

        {/* Equipment and difficulty badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge
            data-testid="equipment-badge"
            variant="outline"
            className="text-[14px]"
          >
            {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
          </Badge>
          <Badge
            variant={exercise.difficulty === 'advanced' ? 'secondary' : 'outline'}
            className="text-[14px]"
          >
            {DIFFICULTY_LABELS[exercise.difficulty] ?? exercise.difficulty}
          </Badge>
        </div>

        {/* CTAs: View warm-up + More */}
        <div className="flex items-center gap-3">
          <Badge
            data-testid="view-warmup-badge"
            variant="link"
            className="text-primary cursor-pointer text-[14px]"
            onClick={(e) => { e.stopPropagation(); onOpenWarmup() }}
          >
            View warm-up
          </Badge>
          {!isLevel2 && (
            <Button
              variant="link"
              size="sm"
              className="text-primary text-[14px] p-0 h-auto"
              onClick={(e) => { e.stopPropagation(); onToggleLevel2() }}
            >
              More
            </Button>
          )}
        </div>

        {/* Level 2 expansion */}
        {isLevel2 && (
          <div className="animate-accordion-down mt-4 pt-4 border-t border-border">
            {exercise.formCues.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[14px] font-semibold text-foreground mb-2">Form Cues</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {exercise.formCues.map((cue, i) => (
                    <li key={i} className="text-[14px] text-muted-foreground">{cue}</li>
                  ))}
                </ol>
              </div>
            )}

            {exercise.secondaryMuscles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[14px] font-semibold text-foreground mb-2">Secondary Muscles</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.secondaryMuscles.map(slug => {
                    const muscle = muscles.find(m => m.slug === slug)
                    return (
                      <Badge
                        key={slug}
                        variant="outline"
                        className="text-[14px] opacity-60"
                      >
                        {muscle?.displayName ?? slug}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MiniMuscleMap placeholder — rendered by Plan 03 */}
            <div id={`mini-map-${exercise.slug}`} className="flex justify-center my-4">
              {/* MiniMuscleMap will be added here in Plan 03 */}
            </div>

            <Button
              variant="link"
              size="sm"
              className="text-primary text-[14px] p-0 h-auto"
              onClick={(e) => { e.stopPropagation(); onToggleLevel2() }}
            >
              Less
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
