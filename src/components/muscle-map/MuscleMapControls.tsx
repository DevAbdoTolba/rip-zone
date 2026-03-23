'use client'

import { Button } from '@/components/ui/button'
import { useMapStore } from '@/stores/useMapStore'
import type { MapView, DetailMode } from '@/stores/useMapStore'

const VIEWS: MapView[] = ['front', 'back']
const DETAIL_MODES: DetailMode[] = ['normal', 'advanced', 'anatomy']

export function MuscleMapControls() {
  const { currentView, setView, detailMode, setDetailMode } = useMapStore()

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Front/Back segmented control — D-11 */}
      <div
        role="group"
        aria-label="Body view"
        className="flex rounded-full border border-border bg-muted p-1 gap-1"
      >
        {VIEWS.map((view) => (
          <Button
            key={view}
            variant={currentView === view ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full capitalize min-h-[44px] px-5"
            onClick={() => setView(view)}
            aria-pressed={currentView === view}
          >
            {view}
          </Button>
        ))}
      </div>

      {/* Detail mode toggle — D-02, D-03 */}
      <div
        role="group"
        aria-label="Detail level"
        className="flex rounded-full border border-border bg-muted p-1 gap-1"
      >
        {DETAIL_MODES.map((mode) => (
          <Button
            key={mode}
            variant={detailMode === mode ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full capitalize min-h-[44px] px-4"
            onClick={() => setDetailMode(mode)}
            aria-pressed={detailMode === mode}
          >
            {mode}
          </Button>
        ))}
      </div>
    </div>
  )
}
