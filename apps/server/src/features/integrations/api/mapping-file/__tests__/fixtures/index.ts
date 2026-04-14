import { ExternalServiceTypeEnum } from '../../../../integrations.validator.js'
import { MappingFileKind } from '../../mapping-file.contract.js'

export const CREATE_MAPPING_FILE_ROUTE = '/integrations-api/v1/mapping-files'

export const DELETE_MAPPING_FILE_ROUTE =
  '/integrations-api/v1/mapping-files/:partner/:kind'

export const FETCH_MAPPING_FILE_ROUTE =
  '/integrations-api/v1/mapping-files/:partner/:kind'

const mappingFileKinds = Object.values(MappingFileKind)

export const randomMappingFileKind = (kinds = mappingFileKinds) =>
  kinds[Math.floor(Math.random() * kinds.length)]

const externalServices = Object.values(ExternalServiceTypeEnum)

export const randomPartner = (partners = externalServices) =>
  partners[Math.floor(Math.random() * partners.length)]
