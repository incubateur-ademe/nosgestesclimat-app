import TotalFootprintNumber from '@/components/misc/TotalFootprintNumber'
import ValueChangeDisplay from '@/components/misc/ValueChangeDisplay'
import Card from '@/design-system/layout/Card'

export default function ResultsBlockMobile() {
  return (
    <div className="relative mb-8 md:hidden">
      <Card
        aria-live="polite"
        className="bg-primary-50 relative col-span-1 rounded-lg border-none px-2 py-4 pr-0">
        <TotalFootprintNumber metric="carbone" />

        <ValueChangeDisplay metric="carbone" />
      </Card>
    </div>
  )
}
