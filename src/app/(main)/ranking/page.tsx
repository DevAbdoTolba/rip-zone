import { RankingDashboard } from '@/components/ranking/RankingDashboard'

export default function RankingPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-20">
      <h1 className="text-xl font-semibold text-foreground mb-4">Ranking</h1>
      <RankingDashboard />
    </div>
  )
}
