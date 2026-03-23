import { MuscleMap } from '@/components/muscle-map/MuscleMap'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 py-12">
      <h1 className="text-[20px] font-semibold text-foreground mb-6">Rip Zone</h1>
      <MuscleMap />
    </main>
  )
}
