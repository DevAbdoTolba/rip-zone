import { MuscleMap } from '@/components/muscle-map/MuscleMap'
import { MusclePanelDrawer } from '@/components/muscle-panel/MusclePanelDrawer'
import exercisesData from '@/../data/exercises.json'
import musclesData from '@/../data/muscles.json'
import warmupsData from '@/../data/warmups.json'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 py-12">
      <h1 className="text-[20px] font-semibold text-foreground mb-6">Rip Zone</h1>
      <MuscleMap />
      <MusclePanelDrawer
        exercises={exercisesData}
        muscles={musclesData}
        warmups={warmupsData}
      />
    </main>
  )
}
