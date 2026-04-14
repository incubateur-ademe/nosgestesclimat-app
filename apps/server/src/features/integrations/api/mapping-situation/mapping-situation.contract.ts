import { initContract, ZodErrorSchema } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { SituationSchema } from '../../../simulations/simulations.validator.js'
import { ExternalServiceTypeEnum } from '../../integrations.validator.js'
import { MAPPING_CASES } from './mapping-situation.constant.js'

const MappingSituationParams = z
  .object({
    partner: z.enum(ExternalServiceTypeEnum),
  })
  .strict()

export type MappingSituationParams = z.infer<typeof MappingSituationParams>

const MappingSituationQuery = z
  .object({
    mappingCase: z
      .enum(MAPPING_CASES)
      .optional()
      .default(MAPPING_CASES.camelCase),
  })
  .strict()

export type MappingSituationQuery = z.infer<typeof MappingSituationQuery>

const MappingSituationDto = z
  .object({
    situation: SituationSchema,
  })
  .strict()

export type MappingSituationDto = z.infer<typeof MappingSituationDto>

const c = initContract()

const contract = c.router({
  mapSituation: {
    method: 'PUT',
    path: '/integrations-api/v1/mapping-situation/:partner',
    query: MappingSituationQuery,
    pathParams: MappingSituationParams,
    body: MappingSituationDto,
    responses: {
      [StatusCodes.OK as number]: z.unknown(),
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Maps a ngc situation following partner configuration',
  },
})

export default contract
