import CarbonFootprintResults from '@/components/results/carbonFootprint/CarbonFootprintResults'
import { modalClassName } from '@/design-system/modals/Modal'
import type { SimulationResult } from '@/helpers/server/model/simulationResult'
import type { Locale } from '@/i18nConfig'
import type { PropsWithChildren } from 'react'

const DUMMY_SIMULATION_RESULT: SimulationResult = {
  group: null,
  computedResults: {
    carbone: {
      bilan: 9000,
      categories: {
        transport: 2750,
        alimentation: 2500,
        logement: 1500,
        divers: 1250,
        'services sociétaux': 1000,
      } as SimulationResult['computedResults']['carbone']['categories'],
    },
    eau: {
      bilan: 1200000,
      categories: {
        transport: 150000,
        alimentation: 700000,
        logement: 200000,
        divers: 100000,
        'services sociétaux': 50000,
      } as SimulationResult['computedResults']['eau']['categories'],
    },
  },
}
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
          simulationResult={DUMMY_SIMULATION_RESULT}
          locale={locale as Locale}
          hideSaveBlock
        />
      </div>
    </>
  )
}
