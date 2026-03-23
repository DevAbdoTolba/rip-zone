'use client'

import { Trophy } from 'lucide-react'

export function PRBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold shadow-[0_0_8px_2px] shadow-primary/50 animate-pulse">
      <Trophy size={12} />
      PR
    </span>
  )
}
