import HideInIframe from '@/components/layout/HideInIframe'
import type { GroupDisplayInfo } from '@/helpers/server/model/utils/getGroupDisplayInfo'
import type { Locale } from '@/i18nConfig'
import type { ComputedResults } from '@/publicodes-state/types'
import type { Tendency } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import Trans from '../../translation/trans/TransServer'
import ActionsBlock from '../ActionsBlock'
import FootprintDetail from '../FootprintDetail'
import GroupThankYouBlock from '../GroupThankYouBlock'
import Objective from '../objective/Objective'
import SaveResultsBlock from '../SaveResultsBlock'
import CarbonFootprintHero from './CarbonFootprintHero'

interface Props {
  computedResults: ComputedResults
  locale: Locale
  hideSaveBlock?: boolean
  tendency?: Tendency
  hasPreviousSimulation?: boolean
  group?: GroupDisplayInfo | null
}

export default function CarbonFootprintResults({
  computedResults,
  locale,
  hideSaveBlock = false,
  tendency,
  hasPreviousSimulation = false,
  group,
}: Props) {
  return (
    <>
      <CarbonFootprintHero
        className="mb-8 md:mb-12"
        value={computedResults.carbone.bilan}
        tendency={tendency}
      />

      <FootprintDetail
        computedResults={computedResults}
        locale={locale}
        metric="carbone"
      />

      {group && <GroupThankYouBlock group={group} />}

      {!hideSaveBlock && (
        <SaveResultsBlock hasPreviousSimulation={hasPreviousSimulation} />
      )}

      <HideInIframe>
        <Objective carbonFootprint={computedResults.carbone.bilan} />
      </HideInIframe>

      <p className="text-primary-600 mx-auto mb-12 w-2xl max-w-full text-center">
        <Trans i18nKey="carbonResults.objective.description">
          <strong className="md:block">Vous avez votre rôle à jouer.</strong>{' '}
          Nous sommes là pour vous aider.
        </Trans>
      </p>

      <ActionsBlock className="mb-20" />
    </>
  )
}
