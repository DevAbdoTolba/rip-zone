'use client'

export function AccuracyRing({ pct }: { pct: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (pct / 100) * circumference
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`Accuracy ${pct}%`}>
      {/* Track */}
      <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--muted)" strokeWidth="4" />
      {/* Fill */}
      <circle
        cx="28" cy="28" r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" className="text-[10px] fill-foreground font-medium">
        {pct}%
      </text>
    </svg>
  )
}
