'use client'

import { cn } from '@/lib/utils'

export const CATEGORY_LABELS: Record<string, string> = {
  'all': 'All',
  'muscle-pain': 'Muscle Pain',
  'progress': 'Progress',
  'misconceptions': 'Myths',
  'nutrition-basics': 'Nutrition',
  'recovery': 'Recovery',
  'training-form': 'Form',
}

export const CATEGORY_VALUES = [
  'all',
  'muscle-pain',
  'progress',
  'misconceptions',
  'nutrition-basics',
  'recovery',
  'training-form',
]

// Base chip classes shared across both states (matches ExerciseFilters pattern)
const chipBase = 'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-[14px] font-medium whitespace-nowrap transition-all cursor-pointer'

interface FaqFiltersProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

export function FaqFilters({ activeCategory, onCategoryChange }: FaqFiltersProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {CATEGORY_VALUES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onCategoryChange(cat)}
          className={cn(
            chipBase,
            activeCategory === cat
              ? 'bg-primary text-primary-foreground border-transparent'
              : 'bg-card text-muted-foreground border border-border hover:bg-muted'
          )}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
