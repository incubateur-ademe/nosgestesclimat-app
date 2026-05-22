import { initContract, ZodErrorSchema } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import { SituationSchema } from '../../../simulations/simulations.validator.ts'
import { ExternalServiceTypeEnum } from '../../integrations.validator.ts'
import { MAPPING_CASES } from './mapping-situation.constant.ts'

const MappingSituationParams = v.strictObject({
  partner: v.enum(ExternalServiceTypeEnum),
})

export type MappingSituationParams = v.InferOutput<
  typeof MappingSituationParams
>

const MappingSituationQuery = v.strictObject({
  mappingCase: v.optional(v.enum(MAPPING_CASES), MAPPING_CASES.camelCase),
})

export type MappingSituationQuery = v.InferOutput<typeof MappingSituationQuery>

const MappingSituationDto = v.strictObject({
  situation: SituationSchema,
})

export type MappingSituationDto = v.InferOutput<typeof MappingSituationDto>

const c = initContract()

const contract = c.router({
  mapSituation: {
    method: 'PUT',
    path: '/integrations-api/v1/mapping-situation/:partner',
    query: MappingSituationQuery,
    pathParams: MappingSituationParams,
    body: MappingSituationDto,
    responses: {
      [StatusCodes.OK as number]: v.unknown(),
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Maps a ngc situation following partner configuration',
  },
})

export default contract
