'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import type { WorkoutSessionRecord } from '@/lib/db/workouts'

interface SessionRowProps {
  session: WorkoutSessionRecord
  exerciseCount: number
  totalSets: number
  totalVolume: number
  isExpanded: boolean
  onToggle: () => void
}

export function SessionRow({
  session,
  exerciseCount,
  totalSets,
  totalVolume,
  isExpanded,
  onToggle,
}: SessionRowProps) {
  const date = new Date(session.startedAt)
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)

  // Label: plan name if available, otherwise "Freestyle"
  // Since we only have planId (not name), show "Freestyle" for null planId
  // Plan name resolution happens at the page level if needed
  const label = session.planId ? 'Plan' : 'Freestyle'

  return (
    <div
      className="py-3 px-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-muted/20 transition-colors"
      onClick={onToggle}
      data-testid="session-row"
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[15px] font-medium text-foreground">{dateLabel}</span>
        <span className="text-[13px] text-muted-foreground">
          {label} &middot; {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} &middot; {totalSets} set{totalSets !== 1 ? 's' : ''} &middot; {Math.round(totalVolume)}kg
        </span>
      </div>
      <div className="flex-shrink-0 ml-2 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)' }}>
        {isExpanded
          ? <ChevronDown size={16} className="text-muted-foreground" />
          : <ChevronRight size={16} className="text-muted-foreground" />
        }
      </div>
    </div>
  )
}
