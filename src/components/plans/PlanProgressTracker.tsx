'use client'

import { Check } from 'lucide-react'

interface PlanProgressTrackerProps {
  totalDays: number
  completedDays: number
}

export function PlanProgressTracker({ totalDays, completedDays }: PlanProgressTrackerProps) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Check className="h-3.5 w-3.5 text-primary" />
      {completedDays}/{totalDays} days done
    </span>
  )
}
