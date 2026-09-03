import CarbonFootprintResults from '@/components/results/carbonFootprint/CarbonFootprintResults'
import { modalClassName } from '@/design-system/modals/Modal'
import type { ComputedResults } from '@/publicodes-state/types'
import type { Locale } from '@/i18nConfig'
import type { PropsWithChildren } from 'react'

const DUMMY_COMPUTED_RESULTS = {
  carbone: {
    bilan: 9000,
    categories: {
      transport: 2750,
      alimentation: 2500,
      logement: 1500,
      divers: 1250,
      'services sociétaux': 1000,
    },
    subcategories: {},
  },
  eau: {
    bilan: 1200000,
    categories: {
      transport: 150000,
      alimentation: 700000,
      logement: 200000,
      divers: 100000,
      'services sociétaux': 50000,
    },
    subcategories: {},
  },
} as ComputedResults

export default function ErrorPage({
  children,
  locale,
}: PropsWithChildren<{ locale: string }>) {
  return (
    <>
      <div
        className={
          'fixed top-0 right-0 bottom-0 left-0 z-10000 flex flex-col overflow-auto bg-black/50 backdrop-blur-sm transition-opacity duration-500'
        }>
        <dialog open className={modalClassName}>
          {children}
        </dialog>
      </div>

      <div>
        <CarbonFootprintResults
          computedResults={DUMMY_COMPUTED_RESULTS}
          locale={locale as Locale}
          hideSaveBlock
        />
      </div>
    </>
  )
}
