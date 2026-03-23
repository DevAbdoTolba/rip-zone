'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { WorkoutPlan, WorkoutPlanExercise, Difficulty, WorkoutPlanId } from '@/types/workout'
import type { PlanProgressRecord } from '@/lib/db/workouts'
import { isPlanAboveLevel } from '@/lib/plan-recommendation'
import { PlanDayPicker } from './PlanDayPicker'
import { PlanProgressTracker } from './PlanProgressTracker'

interface PlanBrowserProps {
  plans: WorkoutPlan[]
  userLevel: Difficulty
  progress: PlanProgressRecord[]
  onStartDay: (planId: WorkoutPlanId, dayLabel: string, exercises: WorkoutPlanExercise[]) => void
}

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  beginner: 'bg-green-500/15 text-green-400 border border-green-500/30',
  intermediate: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  advanced: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function PlanBrowser({ plans, userLevel, progress, onStartDay }: PlanBrowserProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<WorkoutPlanId | null>(null)

  return (
    <div className="space-y-3">
      {plans.map(plan => {
        const isExpanded = selectedPlanId === plan.id
        const isRecommended = plan.difficulty === userLevel
        const isAboveLevel = isPlanAboveLevel(plan.difficulty, userLevel)

        // Count unique days for this plan
        const totalDays = new Set(plan.exercises.map(e => e.dayLabel)).size
        // Count completed days for this plan
        const planProgress = progress.filter(p => p.planId === plan.id)
        const completedDays = new Set(planProgress.map(p => p.dayLabel)).size

        return (
          <div key={plan.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
            {/* Plan card header — tappable to expand */}
            <button
              onClick={() =>
                setSelectedPlanId(prev => (prev === plan.id ? null : plan.id))
              }
              className="w-full text-left p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                    {isRecommended && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{plan.goal}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGE[plan.difficulty]}`}
                    >
                      {DIFFICULTY_LABEL[plan.difficulty]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {plan.daysPerWeek} days/week
                    </span>
                    {completedDays > 0 && (
                      <PlanProgressTracker
                        totalDays={totalDays}
                        completedDays={completedDays}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>

            {/* Warning for plans above user level */}
            {isAboveLevel && (
              <p className="px-4 pb-3 text-sm text-muted-foreground">
                This program requires {plan.daysPerWeek} days/week — better suited for{' '}
                {plan.difficulty} lifters
              </p>
            )}

            {/* Expanded day picker */}
            {isExpanded && (
              <div className="border-t border-border/60">
                <PlanDayPicker
                  plan={plan}
                  progress={planProgress}
                  onStartDay={(dayLabel, exercises) =>
                    onStartDay(plan.id, dayLabel, exercises)
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
