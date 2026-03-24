'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface WarmupMovement {
  name: string
  instruction: string
  duration: string
}

interface WarmupJSON {
  muscleGroup: string
  movements: WarmupMovement[]
}

interface PanelWarmupSectionProps {
  muscleGroup: string | undefined
  warmups: WarmupJSON[]
}

export function PanelWarmupSection({ muscleGroup, warmups }: PanelWarmupSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [muscleGroup])

  const warmupEntry = warmups.find(w => w.muscleGroup === muscleGroup)
  const movements = warmupEntry?.movements ?? []

  return (
    <div data-testid="panel-warmup-section">
      <div className="border-t border-border pt-3">
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
          className="flex items-center justify-between w-full py-1 min-h-[44px] text-[14px] font-semibold text-foreground"
        >
          Warm-up guide
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {isOpen && (
          <div className="animate-accordion-down">
            {movements.length === 0 ? (
              <p className="text-[14px] text-muted-foreground py-2">
                No warm-up guidance available for this muscle.
              </p>
            ) : (
              <ol className="space-y-1">
                {movements.map((m, i) => (
                  <li key={i} className="flex gap-3 py-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[14px] font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-[14px] font-semibold text-foreground">{m.name}</h4>
                      <p className="text-[16px] text-muted-foreground mt-1">{m.instruction}</p>
                      <span className="text-[14px] text-muted-foreground mt-1 block">{m.duration}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
