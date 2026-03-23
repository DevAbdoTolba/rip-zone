'use client'

import { useState } from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { Check, Minus, Plus } from 'lucide-react'
import { PRBadge } from './PRBadge'

interface SetRowProps {
  setNumber: number
  defaultReps: number
  defaultWeightKg: number
  isPR: boolean
  confirmed: boolean
  onConfirm: (reps: number, weightKg: number) => void
}

export function SetRow({
  setNumber,
  defaultReps,
  defaultWeightKg,
  isPR,
  confirmed,
  onConfirm,
}: SetRowProps) {
  const [reps, setReps] = useState(defaultReps)
  const [weightKg, setWeightKg] = useState(defaultWeightKg)

  const handleConfirm = () => {
    onConfirm(reps, weightKg)
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 opacity-60">
        <span className="w-6 text-[13px] font-semibold text-muted-foreground text-center">
          {setNumber}
        </span>
        <span className="flex-1 text-[14px] text-muted-foreground">
          {reps} reps × {weightKg} kg
        </span>
        {isPR && <PRBadge />}
        <Check size={14} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/10 border border-border/50">
      <span className="w-6 text-[13px] font-semibold text-foreground text-center">
        {setNumber}
      </span>

      {/* Reps NumberField */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-[12px] text-muted-foreground w-8">Reps</span>
        <NumberField.Root
          value={reps}
          onValueChange={(val) => setReps(val ?? defaultReps)}
          min={1}
          max={100}
          step={1}
          className="flex items-center"
        >
          <NumberField.Group className="flex items-center border border-border rounded-lg overflow-hidden">
            <NumberField.Decrement
              className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Decrease reps"
            >
              <Minus size={12} />
            </NumberField.Decrement>
            <NumberField.Input
              className="w-10 h-7 text-center text-[14px] font-medium bg-background text-foreground focus:outline-none"
              aria-label="Reps"
            />
            <NumberField.Increment
              className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Increase reps"
            >
              <Plus size={12} />
            </NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
      </div>

      {/* Weight NumberField */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-[12px] text-muted-foreground w-6">kg</span>
        <NumberField.Root
          value={weightKg}
          onValueChange={(val) => setWeightKg(val ?? defaultWeightKg)}
          min={0}
          step={0.5}
          className="flex items-center"
        >
          <NumberField.Group className="flex items-center border border-border rounded-lg overflow-hidden">
            <NumberField.Decrement
              className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Decrease weight"
            >
              <Minus size={12} />
            </NumberField.Decrement>
            <NumberField.Input
              className="w-12 h-7 text-center text-[14px] font-medium bg-background text-foreground focus:outline-none"
              aria-label="Weight in kg"
            />
            <NumberField.Increment
              className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Increase weight"
            >
              <Plus size={12} />
            </NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
      </div>

      {isPR && <PRBadge />}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        aria-label="Confirm set"
      >
        <Check size={14} />
      </button>
    </div>
  )
}
