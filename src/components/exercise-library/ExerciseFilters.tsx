'use client'

import { Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
          placeholder="Search exercises..."
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
      <div className="flex items-center mb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        <span className="text-[14px] text-muted-foreground mr-2 shrink-0">Equipment</span>
        <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1">
          {EQUIPMENT_VALUES.map((eq) => (
            <Badge
              key={eq}
              onClick={() => onEquipmentChange(equipment === eq ? '' : eq)}
              className={cn(
                'cursor-pointer shrink-0 text-[14px]',
                equipment === eq
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              )}
            >
              {EQUIPMENT_LABELS[eq]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="flex items-center" style={{ WebkitOverflowScrolling: 'touch' }}>
        <span className="text-[14px] text-muted-foreground mr-2 shrink-0">Difficulty</span>
        <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1">
          {DIFFICULTY_VALUES.map((diff) => (
            <Badge
              key={diff}
              onClick={() => onDifficultyChange(difficulty === diff ? '' : diff)}
              className={cn(
                'cursor-pointer shrink-0 text-[14px]',
                difficulty === diff
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              )}
            >
              {DIFFICULTY_LABELS[diff]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
