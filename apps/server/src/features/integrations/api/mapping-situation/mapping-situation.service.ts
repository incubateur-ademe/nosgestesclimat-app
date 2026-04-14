import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import modelRules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import Engine from 'publicodes'
import yaml from 'yaml'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import type { ExternalServiceTypeEnum } from '../../integrations.validator.js'
import {
  MappingFileKind,
  type MappingFileParams,
} from '../mapping-file/mapping-file.contract.js'
import { getMappingFile } from '../mapping-file/mapping-file.service.js'
import { MAPPING_CASES_FUNC } from './mapping-situation.constant.js'
import type {
  MappingSituationDto,
  MappingSituationQuery,
} from './mapping-situation.contract.js'

const fetchPartnerMappingFile = async (params: MappingFileParams) => {
  try {
    return yaml.parse((await getMappingFile(params)) || '')
  } catch (err) {
    if (err instanceof EntityNotFoundException) {
      return {}
    }
    throw err
  }
}

const fetchPartnerMappingFiles = async (partner: ExternalServiceTypeEnum) => {
  return (
    await Promise.all(
      Object.values(MappingFileKind).map(async (kind) => ({
        kind,
        file: await fetchPartnerMappingFile({ partner, kind }),
      }))
    )
  ).reduce(
    (acc, { kind, file }) => {
      acc[kind] = file
      return acc
    },
    {} as Record<MappingFileKind, unknown>
  )
}

const isPartnerRecord = (record: unknown): record is Record<string, unknown> =>
  !!record && typeof record === 'object'

const isPartnerCustomMapping = (
  customMapping: unknown
): customMapping is Array<{
  ngcValue: unknown
  mapsTo: unknown
}> =>
  Array.isArray(customMapping) &&
  customMapping.every((value) => 'ngcValue' in value && 'mapsTo' in value)

export const mapPartnerSituation = async ({
  query,
  partner,
  mappingSituationDto: { situation },
}: {
  query: MappingSituationQuery
  partner: ExternalServiceTypeEnum
  mappingSituationDto: MappingSituationDto
}) => {
  const files = await fetchPartnerMappingFiles(partner)
  const partnerRules = files[MappingFileKind.conversion]
  const partnerDefault = files[MappingFileKind.default]
  const partnerAbsent = files[MappingFileKind.absent]
  const partnerValues = files[MappingFileKind.values]

  if (!isPartnerRecord(partnerRules)) {
    return {}
  }

  const rules = {
    ...modelRules,
    ...partnerRules,
  } as Partial<NGCRules>

  const partnerDefaultValues: Record<string, unknown> = isPartnerRecord(
    partnerDefault
  )
    ? partnerDefault
    : {}
  const partnerAbsentValues: Record<string, unknown> = isPartnerRecord(
    partnerAbsent
  )
    ? partnerAbsent
    : {}

  let partnerCustomMapping = new Map()
  if (isPartnerCustomMapping(partnerValues)) {
    partnerCustomMapping = new Map(
      partnerValues.map(({ ngcValue, mapsTo }) => [ngcValue, mapsTo])
    )
  }

  const engine = new Engine(rules)

  engine.setSituation(situation)

  const partnerSituation: Record<string, unknown> = {}

  const mappedSituation = Object.keys(partnerRules).reduce((acc, rule) => {
    if (rule.startsWith('utils')) {
      return acc
    }

    const { nodeValue } = engine.evaluate(rule)

    switch (nodeValue) {
      case 'default':
        acc[rule] = partnerDefaultValues[rule]
        break
      case undefined:
      case null:
      case 'absent':
        acc[rule] = partnerAbsentValues[rule]
        break
      default:
        acc[rule] = partnerCustomMapping.get(nodeValue) ?? nodeValue
    }

    return acc
  }, partnerSituation)

  return MAPPING_CASES_FUNC[query.mappingCase](mappedSituation)
}
