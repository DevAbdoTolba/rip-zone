'use client'

import { useEffect, useState, useRef } from 'react'
import { Timer, Play, Pause, Plus, Minus, X } from 'lucide-react'
import { useWorkoutStore } from '@/stores/useWorkoutStore'

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function RestTimerWidget() {
  const { timer, tickTimer, pauseTimer, resumeTimer, adjustTimer, dismissTimer } = useWorkoutStore()
  const [expanded, setExpanded] = useState(false)
  const completedRef = useRef(false)

  // Tick interval
  useEffect(() => {
    if (!timer.running || timer.remaining <= 0) return
    const interval = setInterval(() => {
      tickTimer()
    }, 1000)
    return () => clearInterval(interval)
  }, [timer.running, timer.remaining, tickTimer])

  // Handle timer completion
  useEffect(() => {
    if (timer.remaining === 0 && timer.total > 0 && !completedRef.current) {
      completedRef.current = true

      // Sound: AudioContext beep at 880Hz
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        osc.frequency.value = 880
        osc.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
      } catch {
        // AudioContext not available in this environment
      }

      // Vibration: double pulse pattern
      navigator.vibrate?.([200, 100, 200])

      // Auto-dismiss after brief delay so user sees 0:00
      setTimeout(() => {
        dismissTimer()
        completedRef.current = false
      }, 1500)
    }

    // Reset completion flag when timer is active again
    if (timer.remaining > 0) {
      completedRef.current = false
    }
  }, [timer.remaining, timer.total, dismissTimer])

  // Hide when no active timer
  if (timer.remaining <= 0 && !timer.running) return null

  const progress = timer.total > 0 ? timer.remaining / timer.total : 0

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-card border border-primary/50 rounded-full px-3 py-2 shadow-lg shadow-primary/20"
        aria-label="Rest timer"
      >
        <Timer size={14} className="text-primary" />
        <span className="text-[13px] font-mono font-semibold text-foreground tabular-nums">
          {formatTime(timer.remaining)}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-card border border-border rounded-2xl p-4 shadow-xl w-56">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Timer size={14} className="text-primary" />
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Rest
          </span>
        </div>
        <button
          onClick={() => {
            dismissTimer()
            setExpanded(false)
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss timer"
        >
          <X size={12} className="text-muted-foreground" />
        </button>
      </div>

      {/* Remaining time */}
      <p className="text-[32px] font-mono font-bold text-foreground tabular-nums text-center mb-3">
        {formatTime(timer.remaining)}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* -15s */}
        <button
          onClick={() => adjustTimer(-15)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Subtract 15 seconds"
        >
          <Minus size={14} className="text-foreground" />
        </button>

        {/* Pause / Resume */}
        <button
          onClick={() => (timer.running ? pauseTimer() : resumeTimer())}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label={timer.running ? 'Pause timer' : 'Resume timer'}
        >
          {timer.running ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* +15s */}
        <button
          onClick={() => adjustTimer(15)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Add 15 seconds"
        >
          <Plus size={14} className="text-foreground" />
        </button>
      </div>

      {/* Collapse */}
      <button
        onClick={() => setExpanded(false)}
        className="mt-3 w-full text-center text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Collapse
      </button>
    </div>
  )
}
