'use client'

import { Dialog } from '@base-ui/react/dialog'

const GROUP_DISPLAY_NAMES: Record<string, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', arms: 'Arms',
  forearms: 'Forearms', core: 'Core', legs: 'Legs', glutes: 'Glutes', calves: 'Calves',
}

interface WarmupMovement {
  name: string
  instruction: string
  duration: string
}

interface WarmupSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  muscleGroup: string | null
  movements: WarmupMovement[]
}

export function WarmupSheet({ open, onOpenChange, muscleGroup, movements }: WarmupSheetProps) {
  if (!muscleGroup) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-background/80" />
        <Dialog.Popup
          data-testid="warmup-sheet"
          className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[80vh] overflow-y-auto p-6 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-md md:w-full md:border md:max-h-[80vh]"
        >
          <Dialog.Title className="text-[20px] font-semibold text-foreground mb-4">
            {GROUP_DISPLAY_NAMES[muscleGroup] ?? muscleGroup} Warm-up
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Warm-up movements for {GROUP_DISPLAY_NAMES[muscleGroup] ?? muscleGroup} muscle group
          </Dialog.Description>
          <ol className="space-y-4">
            {movements.map((movement, i) => (
              <li key={i} data-testid="warmup-movement" className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[14px] font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-foreground">{movement.name}</h4>
                  <p className="text-[16px] text-muted-foreground mt-1">{movement.instruction}</p>
                  <span className="text-[14px] text-muted-foreground mt-1 block">{movement.duration}</span>
                </div>
              </li>
            ))}
          </ol>
          <Dialog.Close className="mt-6 w-full rounded-lg bg-muted text-foreground py-2 text-[14px] font-normal hover:bg-muted/80 transition-colors">
            Close
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
