import faqData from '@/../data/faq-entries.json'
import { FaqPage } from '@/components/faq/FaqPage'

export default function FaqPageRoute() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-20">
      <h1 className="text-xl font-semibold text-foreground mb-4">FAQ</h1>
      <FaqPage entries={faqData} />
    </div>
  )
}
