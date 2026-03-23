'use client'

import { Check, ChevronRight } from 'lucide-react'
import type { WorkoutPlan, WorkoutPlanExercise } from '@/types/workout'
import type { PlanProgressRecord } from '@/lib/db/workouts'

interface PlanDayPickerProps {
  plan: WorkoutPlan
  progress: PlanProgressRecord[]
  onStartDay: (dayLabel: string, exercises: WorkoutPlanExercise[]) => void
}

export function PlanDayPicker({ plan, progress, onStartDay }: PlanDayPickerProps) {
  // Extract unique dayLabels in order, group exercises by dayLabel
  const dayMap = new Map<string, WorkoutPlanExercise[]>()
  for (const exercise of plan.exercises) {
    const existing = dayMap.get(exercise.dayLabel) ?? []
    dayMap.set(exercise.dayLabel, [...existing, exercise])
  }

  // Sort days by the "Day N:" prefix number
  const days = Array.from(dayMap.entries())
    .map(([dayLabel, exercises]) => ({
      dayLabel,
      exercises: exercises.sort((a, b) => a.orderIndex - b.orderIndex),
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.dayLabel.match(/Day (\d+)/)?.[1] ?? '0', 10)
      const bNum = parseInt(b.dayLabel.match(/Day (\d+)/)?.[1] ?? '0', 10)
      return aNum - bNum
    })

  const completedDayLabels = new Set(progress.map(p => p.dayLabel))

  return (
    <div className="divide-y divide-border/50">
      {days.map(({ dayLabel, exercises }, idx) => {
        const isCompleted = completedDayLabels.has(dayLabel)
        return (
          <button
            key={dayLabel}
            onClick={() => onStartDay(dayLabel, exercises)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{dayLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground" />
          </button>
        )
      })}
    </div>
  )
}
