'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface HealthData {
  mongodb: 'connected' | 'error'
  error?: string
  seed?: {
    muscles: number
    exercises: number
    plans: number
    faq: number
  }
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [dexieReady, setDexieReady] = useState<boolean | null>(null)

  useEffect(() => {
    // Check MongoDB via API
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthData) => setHealth(data))
      .catch(() => setHealth({ mongodb: 'error', error: 'Failed to reach API' }))

    // Check Dexie availability
    async function checkDexie() {
      try {
        const { workoutsDb } = await import('@/lib/db/workouts')
        const { profileDb } = await import('@/lib/db/profile')
        // Attempt to open both databases
        await workoutsDb.open()
        await profileDb.open()
        setDexieReady(true)
      } catch {
        setDexieReady(false)
      }
    }
    checkDexie()
  }, [])

  const hasSeedData =
    health?.seed &&
    (health.seed.muscles > 0 ||
      health.seed.exercises > 0 ||
      health.seed.plans > 0 ||
      health.seed.faq > 0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-[28px] font-semibold text-primary">Rip Zone</h1>
        <p className="mt-2 text-base text-muted-foreground">Foundation loaded</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* MongoDB Status */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <span className="text-sm font-semibold">MongoDB</span>
          {health === null ? (
            <Badge variant="outline">Checking...</Badge>
          ) : health.mongodb === 'connected' ? (
            <Badge className="bg-primary text-primary-foreground">Connected</Badge>
          ) : (
            <Badge variant="destructive">Connection failed — check MONGODB_URI</Badge>
          )}
        </div>

        {/* Dexie Status */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <span className="text-sm font-semibold">Local DB</span>
          {dexieReady === null ? (
            <Badge variant="outline">Checking...</Badge>
          ) : dexieReady ? (
            <Badge className="bg-primary text-primary-foreground">Ready</Badge>
          ) : (
            <Badge variant="destructive">IndexedDB unavailable — private browsing?</Badge>
          )}
        </div>

        {/* Seed Data Status */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <span className="text-sm font-semibold">Reference data</span>
          {health === null ? (
            <Badge variant="outline">Checking...</Badge>
          ) : hasSeedData ? (
            <Badge variant="secondary">
              {health.seed!.muscles} muscles · {health.seed!.exercises} exercises ·{' '}
              {health.seed!.plans} plans · {health.seed!.faq} FAQ entries
            </Badge>
          ) : (
            <Badge variant="outline">No data — run `npm run seed`</Badge>
          )}
        </div>
      </div>
    </main>
  )
}
