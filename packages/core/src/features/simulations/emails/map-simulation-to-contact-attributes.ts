import { Attributes } from '../../emails/email.constant.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

const NUMBER_OF_KG_IN_A_TON = 1000
const NUMBER_OF_DAYS_IN_A_YEAR = 365

export const mapSimulationToContactAttributes = (
  simulation: { computedResults: ComputedResults | null } | null,
  locale: ISOSupportedLanguage
) => {
  const { computedResults } = simulation ?? {}
  const bilan = computedResults?.carbone?.bilan ?? 0
  const transport = computedResults?.carbone?.categories?.transport ?? 0
  const alimentation = computedResults?.carbone?.categories?.alimentation ?? 0
  const logement = computedResults?.carbone?.categories?.logement ?? 0
  const divers = computedResults?.carbone?.categories?.divers ?? 0
  const services =
    computedResults?.carbone?.categories?.['services sociétaux'] ?? 0
  const eau = computedResults?.eau?.bilan ?? 0

  return {
    [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: (
      bilan / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_TRANSPORTS_FOOTPRINT]: (
      transport / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_ALIMENTATION_FOOTPRINT]: (
      alimentation / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_LOGEMENT_FOOTPRINT]: (
      logement / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_DIVERS_FOOTPRINT]: (
      divers / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_SERVICES_FOOTPRINT]: (
      services / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_BILAN_WATER]: Math.round(
      eau / NUMBER_OF_DAYS_IN_A_YEAR
    ).toString(),
  }
}
