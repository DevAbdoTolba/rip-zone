'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Dumbbell, History, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Map', icon: MapPin },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/history', label: 'History', icon: History },
  { href: '/workout', label: 'Workout', icon: Timer },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 items-center justify-around border-t border-border bg-card"
        aria-label="Main navigation"
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 text-[14px] font-normal transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      {/* Desktop: horizontal tab nav at top */}
      <nav
        className="hidden md:flex items-center gap-1 border-b border-border bg-card px-8 h-12"
        aria-label="Main navigation"
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-[14px] font-normal rounded-lg transition-colors',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
