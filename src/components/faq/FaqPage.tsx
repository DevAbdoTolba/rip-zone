'use client'

import { useState } from 'react'
import { FaqFilters } from './FaqFilters'
import { FaqAccordion } from './FaqAccordion'

interface FaqEntry {
  slug: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface FaqPageProps {
  entries: FaqEntry[]
}

export function FaqPage({ entries }: FaqPageProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set())

  const filtered = activeCategory === 'all'
    ? entries
    : entries.filter(e => e.category === activeCategory)

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat)
    setOpenSlugs(new Set())
  }

  function toggleSlug(slug: string) {
    setOpenSlugs(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  return (
    <>
      <FaqFilters activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      <div className="flex flex-col gap-3 mt-4">
        {filtered.map(entry => (
          <FaqAccordion
            key={entry.slug}
            entry={entry}
            isOpen={openSlugs.has(entry.slug)}
            onToggle={() => toggleSlug(entry.slug)}
          />
        ))}
      </div>
    </>
  )
}
