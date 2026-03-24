'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'

interface FaqAccordionProps {
  entry: { slug: string; question: string; answer: string; category: string }
  isOpen: boolean
  onToggle: () => void
}

export function FaqAccordion({ entry, isOpen, onToggle }: FaqAccordionProps) {
  return (
    <div
      data-testid="faq-item"
      className="bg-card rounded-xl border border-border"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 p-4 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[14px] font-medium text-foreground">{entry.question}</span>
        {isOpen ? (
          <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <p className="text-[14px] text-muted-foreground leading-relaxed pt-2 px-4 pb-4">
          {entry.answer}
        </p>
      )}
    </div>
  )
}
