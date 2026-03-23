import { BottomNav } from '@/components/bottom-nav/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BottomNav />
      <div className="flex-1 pb-16 md:pb-0 md:pt-0">{children}</div>
    </>
  )
}
