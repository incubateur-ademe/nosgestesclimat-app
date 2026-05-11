import { exportSituation as twoTonsExportSituation } from '../../adapters/2tonnes/client.ts'
import { exportSituation as agirExportSituation } from '../../adapters/agir/client.ts'
import type { SituationSchema } from '../simulations/simulations.validator.ts'
import type { SituationExportQueryParamsSchema } from './integrations.validator.ts'
import { ExternalServiceTypeEnum } from './integrations.validator.ts'

type ExternalService = keyof typeof ExternalServiceTypeEnum

type ExternalServiceAdapter = {
  exportSituation: (
    situation: SituationSchema,
    params: SituationExportQueryParamsSchema
  ) => Promise<{ redirectUrl: string }>
}

const externalServicesAdapters: Record<
  ExternalService,
  ExternalServiceAdapter
> = {
  [ExternalServiceTypeEnum.agir]: {
    exportSituation: agirExportSituation,
  },
  [ExternalServiceTypeEnum['2-tonnes']]: {
    exportSituation: twoTonsExportSituation,
  },
} as const

type ExternalServiceFeature = {
  hasPossibleSituationExport: boolean
  hasEndSimulationRedirection: boolean
}

const externalServicesFeatures: Record<
  ExternalService,
  ExternalServiceFeature
> = {
  [ExternalServiceTypeEnum.agir]: {
    hasEndSimulationRedirection: true,
    hasPossibleSituationExport: false,
  },
  [ExternalServiceTypeEnum['2-tonnes']]: {
    hasEndSimulationRedirection: false,
    hasPossibleSituationExport: true,
  },
}

const PARTNER_PREFIX = /^partner-/

const removePartnerPrefix = (
  params: SituationExportQueryParamsSchema
): SituationExportQueryParamsSchema =>
  Object.fromEntries(
    Object.entries(params).map(([key, val]) => [
      key.replace(PARTNER_PREFIX, ''),
      val,
    ])
  )

export const getPartnerFeatures = (externalService: ExternalService) =>
  externalServicesFeatures[externalService]

export const exportSituation = ({
  externalService,
  situation,
  params,
}: {
  situation: SituationSchema
  externalService: ExternalService
  params: SituationExportQueryParamsSchema
}) => {
  return externalServicesAdapters[externalService].exportSituation(
    situation,
    removePartnerPrefix(params)
  )
}
