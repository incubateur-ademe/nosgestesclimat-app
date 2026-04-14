import { z } from 'zod'
import { SituationSchema } from '../simulations/simulations.validator.js'

export enum ExternalServiceTypeEnum {
  agir = 'agir',
  '2-tonnes' = '2-tonnes',
}

const ExternalServiceType = z.enum(ExternalServiceTypeEnum)

const ExternalServiceParams = z
  .object({
    externalService: ExternalServiceType,
  })
  .strict()

export type ExternalServiceParams = z.infer<typeof ExternalServiceParams>

const partnerPrefix = 'partner-'

const SituationExportQueryParamsSchema = z
  .record(
    z.string(),
    z.union([
      z.array(z.string().nullable()),
      z.number().nullable(),
      z.string().nullable(),
      z.boolean().nullable(),
    ])
  )
  .refine(
    (data) => Object.keys(data).every((key) => key.startsWith(partnerPrefix)),
    {
      message: `Each key must start with the prefix '${partnerPrefix}*'`,
    }
  )

export type SituationExportQueryParamsSchema = z.infer<
  typeof SituationExportQueryParamsSchema
>

export const FetchExternalServiceValidator = {
  body: z.object({}).strict(),
  query: z.object({}).strict().optional(),
  params: ExternalServiceParams,
}

export const SituationExportValidator = {
  body: SituationSchema,
  params: ExternalServiceParams,
  query: SituationExportQueryParamsSchema,
}
