'use client'

import { Search, X } from 'lucide-react'
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

const EQUIPMENT_VALUES = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', 'kettlebell', 'band', 'other']
const DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced']

// Base chip classes shared across both states
const chipBase = 'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-[14px] font-medium whitespace-nowrap transition-all cursor-pointer'

interface ExerciseFiltersProps {
  query: string
  onQueryChange: (value: string) => void
  equipment: string
  onEquipmentChange: (value: string) => void
  difficulty: string
  onDifficultyChange: (value: string) => void
  muscleFilter: string
  onMuscleFilterChange: (value: string) => void
  muscleGroups: Array<{ slug: string; displayName: string }>
}

export function ExerciseFilters({
  query,
  onQueryChange,
  equipment,
  onEquipmentChange,
  difficulty,
  onDifficultyChange,
}: ExerciseFiltersProps) {
  return (
    <div className="px-8 pb-3 bg-background">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search exercises…"
          className={cn(
            'w-full h-10 pl-9 pr-9 rounded-lg bg-muted text-foreground text-[16px]',
            'placeholder:text-muted-foreground border border-border outline-none',
            'focus:ring-2 focus:ring-primary focus:ring-offset-0',
            'transition-all'
          )}
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Equipment filter */}
      <div className="flex items-center mb-2">
        <span className="text-[14px] text-muted-foreground mr-2 shrink-0">Equipment</span>
        <div
          className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {EQUIPMENT_VALUES.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => onEquipmentChange(equipment === eq ? '' : eq)}
              className={cn(
                chipBase,
                equipment === eq
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              )}
            >
              {EQUIPMENT_LABELS[eq]}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="flex items-center">
        <span className="text-[14px] text-muted-foreground mr-2 shrink-0">Difficulty</span>
        <div
          className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {DIFFICULTY_VALUES.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => onDifficultyChange(difficulty === diff ? '' : diff)}
              className={cn(
                chipBase,
                difficulty === diff
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              )}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
