import type { SimulationResult } from '@/helpers/server/model/simulationResult'
import type { Tendency } from '@/helpers/server/model/utils/getTendency'
import type { Locale } from '@/i18nConfig'
import Trans from '../../translation/trans/TransServer'
import ActionsBlock from '../ActionsBlock'
import FootprintBlock from '../FootprintBlock'
import FootprintDetail from '../FootprintDetail'
import GroupThankYouBlock from '../GroupThankYouBlock'
import SaveResultsBlock from '../SaveResultsBlock'
import Objective from '../objective/Objective'

interface Props {
  simulationResult: SimulationResult
  locale: Locale
  hideSaveBlock?: boolean
  tendency?: Tendency
  hasPreviousSimulation?: boolean
}

export default function CarbonFootprintResults({
  simulationResult,
  locale,
  tendency,
  hideSaveBlock = false,
  hasPreviousSimulation = false,
}: Props) {
  return (
    <>
      <FootprintBlock
        className="mb-12"
        tendency={tendency}
        locale={locale}
        value={simulationResult.computedResults.carbone.bilan}
        title={
          <Trans locale={locale} i18nKey="simulation.carbone.title">
            Vos émissions annuelles :
          </Trans>
        }
        metric="carbone"
        unitSuffix={
          <Trans locale={locale} i18nKey="common.co2eAn">
            CO₂e / an
          </Trans>
        }
      />

      <FootprintDetail
        computedResults={simulationResult.computedResults}
        locale={locale}
        metric="carbone"
      />

      {simulationResult.group && (
        <GroupThankYouBlock locale={locale} group={simulationResult.group} />
      )}

      {!hideSaveBlock && (
        <SaveResultsBlock
          hasPreviousSimulation={hasPreviousSimulation}
          locale={locale}
        />
      )}

      <Objective
        locale={locale}
        carbonFootprint={simulationResult.computedResults.carbone.bilan}
      />

      <p className="text-primary-600 mx-auto mb-12 w-2xl max-w-full text-center">
        <Trans locale={locale} i18nKey="carbonResults.objective.description">
          <strong className="md:block">Vous avez votre rôle à jouer.</strong>{' '}
          Nous sommes là pour vous aider.
        </Trans>
      </p>

      <ActionsBlock locale={locale} />
    </>
  )
}
