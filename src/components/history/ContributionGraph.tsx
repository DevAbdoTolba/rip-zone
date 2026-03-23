'use client'

interface DayData {
  date: string // ISO date string yyyy-mm-dd
  volume: number
}

interface ContributionGraphProps {
  sessions: DayData[]
}

function getIntensityClass(volume: number): string {
  if (volume === 0) return 'bg-muted'
  if (volume < 2000) return 'bg-primary/20'
  if (volume < 5000) return 'bg-primary/40'
  if (volume < 10000) return 'bg-primary/70'
  return 'bg-primary'
}

const MONTH_ABBREVS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

export function ContributionGraph({ sessions }: ContributionGraphProps) {
  // Build volume lookup: date string -> volume
  const volumeByDate = new Map<string, number>()
  for (const s of sessions) {
    volumeByDate.set(s.date, s.volume)
  }

  // Build 91-day window ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: Array<{ dateStr: string; volume: number; date: Date }> = []
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({ dateStr, volume: volumeByDate.get(dateStr) ?? 0, date: d })
  }

  // Pad start to Monday boundary (Monday=0 convention: (getDay()+6)%7)
  const firstDayOfWeek = (days[0].date.getDay() + 6) % 7 // 0=Mon, 6=Sun
  const paddingCount = firstDayOfWeek // cells to prepend as empty

  // Total cells: paddingCount + 91, grid rows = 7, cols = ceil((paddingCount+91)/7)
  // We use 13 columns as specified
  const allCells: Array<{ dateStr: string | null; volume: number; date: Date | null }> = [
    ...Array.from({ length: paddingCount }, () => ({ dateStr: null, volume: 0, date: null })),
    ...days,
  ]

  // Build month labels for top row: show month abbreviation at first cell of a new month
  // Column index determines position; grid flows column-first
  const numCols = 13
  const monthLabels: Array<string | null> = Array(numCols).fill(null)

  let lastMonth: number | null = null
  for (let cellIdx = 0; cellIdx < allCells.length; cellIdx++) {
    const cell = allCells[cellIdx]
    if (!cell.date) continue
    const month = cell.date.getMonth()
    const col = Math.floor(cellIdx / 7)
    if (month !== lastMonth && col < numCols) {
      // Only set if not already set for this column
      if (monthLabels[col] === null) {
        monthLabels[col] = MONTH_ABBREVS[month]
        lastMonth = month
      }
    }
  }

  return (
    <div className="px-4 py-3">
      {/* Month labels row */}
      <div
        className="mb-1 ml-8"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '3px' }}
      >
        {monthLabels.map((label, i) => (
          <div key={i} className="text-[10px] text-muted-foreground truncate">
            {label ?? ''}
          </div>
        ))}
      </div>

      {/* Grid with day labels */}
      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="w-6 h-3 flex items-center">
              <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(13, 1fr)',
            gridTemplateRows: 'repeat(7, 1fr)',
            gridAutoFlow: 'column',
            gap: '3px',
          }}
        >
          {allCells.map((cell, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${cell.dateStr ? getIntensityClass(cell.volume) : 'opacity-0'}`}
              title={cell.dateStr ? `${cell.dateStr}: ${cell.volume}kg` : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
