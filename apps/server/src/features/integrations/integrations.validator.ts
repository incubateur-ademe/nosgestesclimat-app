import * as v from 'valibot'
import { SituationSchema } from '../simulations/simulations.validator.ts'

export const ExternalServiceTypeEnum = {
  agir: 'agir',
  '2-tonnes': '2-tonnes',
} as const

export type ExternalServiceTypeEnum =
  (typeof ExternalServiceTypeEnum)[keyof typeof ExternalServiceTypeEnum]

const ExternalServiceType = v.enum(ExternalServiceTypeEnum)

const ExternalServiceParams = v.strictObject({
  externalService: ExternalServiceType,
})

export type ExternalServiceParams = v.InferOutput<typeof ExternalServiceParams>

const partnerPrefix = 'partner-'

const SituationExportQueryParamsSchema = v.pipe(
  v.record(
    v.string(),
    v.union([
      v.array(v.nullable(v.string())),
      v.nullable(v.number()),
      v.nullable(v.string()),
      v.nullable(v.boolean()),
    ])
  ),
  v.check(
    (data) =>
      Object.keys(data).every((key: string) => key.startsWith(partnerPrefix)),
    `Each key must start with the prefix '${partnerPrefix}*'`
  )
)

export type SituationExportQueryParamsSchema = v.InferOutput<
  typeof SituationExportQueryParamsSchema
>

export const FetchExternalServiceValidator = {
  body: v.strictObject({}),
  query: v.optional(v.strictObject({})),
  params: ExternalServiceParams,
}

export const SituationExportValidator = {
  body: SituationSchema,
  params: ExternalServiceParams,
  query: SituationExportQueryParamsSchema,
}
