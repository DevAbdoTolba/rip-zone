'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { PRBadge } from '@/components/workout/PRBadge'
import type { SetLogRecord } from '@/lib/db/workouts'
import type { ExerciseSlug } from '@/types'

interface ExerciseInDetail {
  slug: ExerciseSlug
  name: string
  sets: SetLogRecord[]
  isPR: (set: SetLogRecord) => boolean
}

interface SessionDetailProps {
  exercises: ExerciseInDetail[]
}

function ExerciseDetailRow({ exercise }: { exercise: ExerciseInDetail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      {/* Exercise header — collapsible */}
      <div
        className="py-2 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsExpanded(e => !e)}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-medium text-foreground">{exercise.name}</span>
          <span className="text-[12px] text-muted-foreground">
            {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isExpanded
            ? <ChevronDown size={14} className="text-muted-foreground" />
            : <ChevronRight size={14} className="text-muted-foreground" />
          }
        </div>
      </div>

      {/* Sets breakdown */}
      {isExpanded && (
        <div className="pb-2 px-4 space-y-1">
          {exercise.sets.map((set) => (
            <div key={set.id} className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">
                Set {set.setNumber}: {set.weightKg}kg &times; {set.reps} reps
              </span>
              {exercise.isPR(set) && <PRBadge />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SessionDetail({ exercises }: SessionDetailProps) {
  if (exercises.length === 0) {
    return (
      <div className="px-4 py-3 text-[13px] text-muted-foreground">
        No exercises recorded for this session.
      </div>
    )
  }

  return (
    <div className="bg-card/50 border-b border-border">
      {exercises.map((exercise) => (
        <ExerciseDetailRow key={exercise.slug} exercise={exercise} />
      ))}
    </div>
  )
}
