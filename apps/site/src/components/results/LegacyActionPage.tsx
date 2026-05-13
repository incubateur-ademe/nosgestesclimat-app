import {
  getSimulationMode,
  type Simulation,
} from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { FormProvider } from '@/publicodes-state'
import NoResultsBlock from '../dashboard/NoResultsBlock'
import TopBar from '../simulation/TopBar'
import ActionAutoSave from './actions/ActionAutoSave'
import ActionsContent from './actions/ActionsContent'
import MTaTerreBanner from './actions/MTaTerreBanner'

interface Props {
  simulations: Simulation[]
  locale: Locale
}
export function LegacyActionPage({ simulations, locale }: Props) {
  const lastSimulation = simulations.at(-1)
  return (
    <div className="mb-20 flex flex-col">
      {simulations.length <= 0 ? (
        <NoResultsBlock locale={locale} />
      ) : (
        <FormProvider>
          <ActionAutoSave />

          <TopBar className="mb-6" simulationMode={false} showTotal />
          {lastSimulation &&
            getSimulationMode(lastSimulation) === 'scolaire' &&
            locale === 'fr' && <MTaTerreBanner locale={locale} />}

          {/* Commented while displaying M ta Terre banner <ActionsTutorial /> */}

          <ActionsContent />
        </FormProvider>
      )}
    </div>
  )
}
