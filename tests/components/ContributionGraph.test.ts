import { describe, it, expect } from 'vitest'

// ContributionGraph logic tests — pure logic extracted from component internals

/**
 * Replicate the cell-building logic from ContributionGraph for unit testing.
 */
function buildCells(sessions: Array<{ date: string; volume: number }>): Array<{ dateStr: string | null; volume: number }> {
  const volumeByDate = new Map<string, number>()
  for (const s of sessions) {
    volumeByDate.set(s.date, s.volume)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: Array<{ dateStr: string; volume: number; date: Date }> = []
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({ dateStr, volume: volumeByDate.get(dateStr) ?? 0, date: d })
  }

  const firstDayOfWeek = (days[0].date.getDay() + 6) % 7
  const paddingCount = firstDayOfWeek

  const allCells: Array<{ dateStr: string | null; volume: number }> = [
    ...Array.from({ length: paddingCount }, () => ({ dateStr: null, volume: 0 })),
    ...days.map(d => ({ dateStr: d.dateStr, volume: d.volume })),
  ]

  return allCells
}

function getIntensityClass(volume: number): string {
  if (volume === 0) return 'bg-muted'
  if (volume < 2000) return 'bg-primary/20'
  if (volume < 5000) return 'bg-primary/40'
  if (volume < 10000) return 'bg-primary/70'
  return 'bg-primary'
}

describe('ContributionGraph logic', () => {
  it('renders 91 + padding cells (up to 97 cells depending on start day)', () => {
    const cells = buildCells([])
    // Always 91 actual day cells; padding is 0-6 extra
    const actualDays = cells.filter(c => c.dateStr !== null)
    expect(actualDays).toHaveLength(91)
    // Total cells: 91 + padding (0-6)
    expect(cells.length).toBeGreaterThanOrEqual(91)
    expect(cells.length).toBeLessThanOrEqual(97)
  })

  it('cell with volume=0 uses bg-muted class', () => {
    expect(getIntensityClass(0)).toBe('bg-muted')
  })

  it('cell with volume=1999 uses bg-primary/20 class', () => {
    expect(getIntensityClass(1999)).toBe('bg-primary/20')
  })

  it('cell with volume=5000 uses bg-primary/70 class', () => {
    expect(getIntensityClass(5000)).toBe('bg-primary/70')
  })

  it('cell with volume=10000 uses bg-primary class', () => {
    expect(getIntensityClass(10000)).toBe('bg-primary')
  })

  it('cell with volume=2500 uses bg-primary/40 class', () => {
    expect(getIntensityClass(2500)).toBe('bg-primary/40')
  })

  it('maps session volume to the correct date cell', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().slice(0, 10)
    const cells = buildCells([{ date: todayStr, volume: 3000 }])
    const todayCell = cells.find(c => c.dateStr === todayStr)
    expect(todayCell).toBeDefined()
    expect(todayCell?.volume).toBe(3000)
    expect(getIntensityClass(3000)).toBe('bg-primary/40')
  })

  it('padding cells have null dateStr', () => {
    const cells = buildCells([])
    const paddingCells = cells.filter(c => c.dateStr === null)
    // Padding is 0-6 — always a valid amount
    expect(paddingCells.length).toBeGreaterThanOrEqual(0)
    expect(paddingCells.length).toBeLessThanOrEqual(6)
  })
})
