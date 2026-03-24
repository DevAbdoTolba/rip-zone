import { BioForm } from '@/components/profile/BioForm'

export default function ProfilePage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-20">
      <h1 className="text-xl font-semibold text-foreground mb-4">Profile</h1>
      <BioForm />
    </div>
  )
}
