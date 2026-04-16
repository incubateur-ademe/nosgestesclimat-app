import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import LatestResults from './LatestResults'
import NoResultsView from './NoResultsView'
import ProfileTab from './ProfileTabs'
import EvolutionGraph from './resultsView/EvolutionGraph'
import ResultsList from './resultsView/ResultsList'
import ShareSimulator from './resultsView/ShareSimulator'

interface Props {
  locale: Locale
  simulations: Simulation[]
  isNewAccount: boolean
  onSimulationDelete: (simulationId: string) => Promise<void>
}

export default function ResultsView({
  locale,
  simulations,
  isNewAccount,
  onSimulationDelete,
}: Props) {
  if (simulations.length === 0) {
    return <NoResultsView locale={locale} />
  }

  return (
    <>
      <ProfileTab locale={locale} activePath={MON_ESPACE_PATH} />

      <LatestResults locale={locale} simulation={simulations[0]} />

      <ShareSimulator locale={locale} />

      <ResultsList
        locale={locale}
        simulations={simulations}
        isNewAccount={isNewAccount}
        onSimulationDelete={onSimulationDelete}
      />

      <EvolutionGraph
        locale={locale}
        simulations={simulations.reverse()}
        hasSingleSimulation={simulations.length === 1}
      />
    </>
  )
}
