import PlusIcon from '@/components/icons/PlusIcon'
import TotalFootprintNumber from '@/components/misc/TotalFootprintNumber'
import ValueChangeDisplay from '@/components/misc/ValueChangeDisplay'
import CategoriesResultList from './resultsBlocksDesktop/CategoriesResultList'

export default function ResultsBlockDesktop() {
  return (
    <section className="relative hidden flex-col gap-4 md:flex">
      <details className="group transition-all duration-200">
        <summary
          className="border-primary-100 focus-visible:ring-primary-700 bg-primary-50 relative z-10 flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg border-2 p-4 focus-visible:ring-2 focus-visible:ring-offset-3 focus-visible:outline-hidden [&::-webkit-details-marker]:hidden [&::marker]:hidden"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const details = e.currentTarget
                .parentElement as HTMLDetailsElement
              details.open = !details.open
            }
          }}>
          <div className="relative w-full">
            <div className="flex items-center gap-2">
              <h2 className="-mb-2 text-[13px] font-bold md:text-base">
                <TotalFootprintNumber metric="carbone" />
              </h2>
            </div>
            <ValueChangeDisplay metric="carbone" size="md" />
          </div>

          <PlusIcon className="stroke-primary-800 inline-block h-4 w-4 min-w-4 origin-center transform transition-transform duration-300 group-open:rotate-45" />
          <span className="sr-only">
            Cliquez pour afficher le détail des résultats
          </span>
        </summary>

        <div className="border-primary-10 -z-10 -mt-2 grid cursor-default grid-rows-[0fr] overflow-hidden rounded-b-xl border-2 border-gray-200 pt-2 transition-all duration-200 ease-in-out group-open:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="pt-1 text-sm md:text-base">
              <CategoriesResultList metric="carbone" />
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}
