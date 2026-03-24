'use client'

import { useEffect } from 'react'
import { Shield } from 'lucide-react'
import { TierRank } from '@/types/ranking'

interface CelebrationOverlayProps {
  newTier: TierRank
  onDismiss: () => void
}

const TIER_COLORS: Record<TierRank, string> = {
  [TierRank.Iron]: '#8B8B8B',
  [TierRank.Bronze]: '#CD7F32',
  [TierRank.Silver]: '#C0C0C0',
  [TierRank.Gold]: '#FFD700',
  [TierRank.Platinum]: '#E5E4E2',
  [TierRank.Diamond]: '#B9F2FF',
  [TierRank.Elite]: '#FF4500',
}

// Generate deterministic confetti pieces with varying properties
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 11) % 100)}%`,
  delay: `${((i * 13) % 200) / 100}s`,
  duration: `${2 + ((i * 7) % 10) / 10}s`,
  color: [
    'oklch(0.85 0.18 195)',
    '#FFD700',
    '#FFFFFF',
    '#FF4500',
    '#B9F2FF',
    '#CD7F32',
  ][i % 6],
  size: `${6 + (i % 4) * 2}px`,
  rotate: `${(i * 47) % 360}deg`,
}))

export function CelebrationOverlay({ newTier, onDismiss }: CelebrationOverlayProps) {
  const tierColor = TIER_COLORS[newTier]

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={`Tier advancement celebration: You reached ${newTier}`}
    >
      {/* CSS-only confetti pieces */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg) translateX(0px);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) translateX(30px);
            opacity: 0;
          }
        }
      `}</style>

      {CONFETTI_PIECES.map(piece => (
        <div
          key={piece.id}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: piece.left,
            top: 0,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
            animation: `confetti-fall ${piece.duration} ${piece.delay} linear forwards`,
            transform: `rotate(${piece.rotate})`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center card — stop propagation so clicking card doesn't dismiss */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 bg-card border border-border rounded-2xl p-8 mx-4 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <Shield size={56} color={tierColor} aria-hidden="true" />
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">
            Tier Up!
          </p>
          <h2 className="text-3xl font-bold" style={{ color: tierColor }}>
            {newTier}
          </h2>
          <p className="text-muted-foreground mt-2">You reached {newTier}!</p>
        </div>
        <button
          className="bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium mt-2 hover:opacity-90 transition-opacity"
          onClick={onDismiss}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
