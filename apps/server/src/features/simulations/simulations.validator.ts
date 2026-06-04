import * as v from 'valibot'
import { ListIds } from '../../adapters/brevo/constant.ts'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
} from '../../adapters/prisma/generated.ts'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'
import { PaginationQuery } from '../../core/pagination.ts'
import { LoginDto } from '../authentication/authentication.validator.ts'
import { PublicPollParams } from '../organisations/organisations.validator.ts'
import { UserParams } from '../users/users.validator.ts'

const MODEL_REGEX = /^[A-Z]+-[a-z]+-(pr-\d+|\d+\.\d+\.\d+(-[\w.]+)?)$/

const SimulationParams = v.strictObject({
  simulationId: v.pipe(v.string(), v.uuid()),
})

export type SimulationParams = v.InferOutput<typeof SimulationParams>

const UserSimulationParams = v.strictObject({
  ...SimulationParams.entries,
  ...UserParams.entries,
})

export type UserSimulationParams = v.InferOutput<typeof UserSimulationParams>

const ActionChoicesSchema = v.record(v.string(), v.boolean())

export type ActionChoicesSchema = v.InferOutput<typeof ActionChoicesSchema>

const CategoriesSchema = v.strictObject({
  alimentation: v.number(),
  transport: v.number(),
  logement: v.number(),
  divers: v.number(),
  'services sociétaux': v.number(),
})

const MetricComputedResultSchema = v.strictObject({
  bilan: v.number(),
  categories: CategoriesSchema,
  subcategories: v.record(v.string(), v.number()),
})

export const ComputedResultSchema = v.strictObject({
  carbone: MetricComputedResultSchema,
  eau: MetricComputedResultSchema,
})

export type ComputedResultSchema = v.InferOutput<typeof ComputedResultSchema>

const AdditionalQuestionsAnswersSchema = v.array(
  v.union([
    v.object({
      type: v.literal(SimulationAdditionalQuestionAnswerType.custom),
      key: v.string(),
      answer: v.string(),
    }),
    v.object({
      type: v.literal(SimulationAdditionalQuestionAnswerType.default),
      key: v.enum(PollDefaultAdditionalQuestionType),
      answer: v.string(),
    }),
  ])
)

export type AdditionalQuestionsAnswersSchema = v.InferOutput<
  typeof AdditionalQuestionsAnswersSchema
>

const FoldedStepsSchema = v.array(v.string())

const SituationNodeValue = v.union([
  v.string(),
  v.number(),
  v.strictObject({
    valeur: v.union([
      v.pipe(v.unknown(), v.transform(Number), v.number()),
      v.pipe(
        v.string(),
        v.transform((s) => +s.replace(/\s/g, '')),
        v.number()
      ),
    ]),
    unité: v.optional(v.string()),
  }),
  v.strictObject({
    type: v.literal('number'),
    fullPrecision: v.boolean(),
    nodeValue: v.number(),
    nodeKind: v.literal('constant'),
    rawNode: v.number(),
    isNullable: v.optional(v.boolean()),
    missingVariables: v.optional(v.object({})),
  }),
  v.strictObject({
    explanation: v.strictObject({
      type: v.literal('number'),
      fullPrecision: v.boolean(),
      nodeValue: v.number(),
      nodeKind: v.literal('constant'),
      rawNode: v.strictObject({
        constant: v.strictObject({
          type: v.union([v.literal('constant'), v.literal('number')]),
          nodeValue: v.number(),
        }),
      }),
      isNullable: v.optional(v.boolean()),
      missingVariables: v.optional(v.object({})),
    }),
    unit: v.strictObject({
      numerators: v.string(),
      denominators: v.optional(v.string()),
    }),
    nodeKind: v.literal('unité'),
    rawNode: v.string(),
  }),
])

const ExtendedSituationNodeValue = v.nullable(
  v.union([SituationNodeValue, v.boolean()])
)

export const SituationSchema = v.record(v.string(), SituationNodeValue)

export type SituationSchema = v.InferOutput<typeof SituationSchema>

const ExtendedSituationSchema = v.record(
  v.string(),
  v.union([
    v.strictObject({
      source: v.literal('omitted'),
    }),
    v.object({
      source: v.union([v.literal('answered'), v.literal('default')]),
      nodeValue: ExtendedSituationNodeValue,
    }),
  ])
)

export type ExtendedSituationSchema = v.InferOutput<
  typeof ExtendedSituationSchema
>

const SimulationCreateUser = v.strictObject({
  email: v.optional(
    v.pipe(
      v.string(),
      v.email(),
      v.transform((email) => email.toLocaleLowerCase())
    )
  ),
  name: v.optional(v.string()),
})

export type SimulationCreateUser = v.InferOutput<typeof SimulationCreateUser>

export const SimulationParticipantCreateDto = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.optional(
    v.pipe(
      v.unknown(),
      v.transform((v) => new Date(v as string | number | Date)),
      v.date()
    ),
    () => new Date()
  ),
  model: v.optional(v.pipe(v.string(), v.regex(MODEL_REGEX))),
  progression: v.number(),
  computedResults: ComputedResultSchema,
  actionChoices: v.optional(ActionChoicesSchema, {}),
  additionalQuestionsAnswers: v.optional(AdditionalQuestionsAnswersSchema),
  foldedSteps: v.optional(FoldedStepsSchema, []),
  situation: SituationSchema,
  extendedSituation: v.optional(ExtendedSituationSchema),
})

export type SimulationParticipantCreateDto = v.InferOutput<
  typeof SimulationParticipantCreateDto
>

export type SimulationParticipantCreateInputDto = v.InferInput<
  typeof SimulationParticipantCreateDto
>

const SimulationCreateDto = v.object({
  ...SimulationParticipantCreateDto.entries,
  user: v.optional(SimulationCreateUser),
})

export type SimulationCreateDto = v.InferOutput<typeof SimulationCreateDto>

export type SimulationCreateInputDto = v.InferInput<typeof SimulationCreateDto>

const SimulationCreateNewsletterList = v.pipe(
  v.union([
    v.optional(
      v.pipe(v.unknown(), v.transform(Number), v.number(), v.enum(ListIds))
    ),
    v.optional(
      v.array(
        v.pipe(v.unknown(), v.transform(Number), v.number(), v.enum(ListIds))
      )
    ),
  ]),
  v.transform((listIds) =>
    typeof listIds === 'number' ? [listIds] : listIds || []
  )
)

const SimulationCreateBaseQuery = v.strictObject({
  newsletters: v.optional(SimulationCreateNewsletterList, []),
  sendEmail: v.optional(v.pipe(v.string(), v.parseBoolean()), 'false'),
  ...LocaleQuery.entries,
})

const SimulationCreateLoginQuery = v.strictObject({
  ...v.omit(LoginDto, ['userId']).entries,
  ...SimulationCreateBaseQuery.entries,
})

const SimulationCreateAnonymousQuery = v.strictObject({
  email: v.optional(v.undefined_()),
  code: v.optional(v.undefined_()),
  ...SimulationCreateBaseQuery.entries,
})

const SimulationCreateQuery = v.union([
  SimulationCreateLoginQuery,
  SimulationCreateAnonymousQuery,
])

export type SimulationCreateQuery = v.InferOutput<typeof SimulationCreateQuery>

export const SimulationCreateValidator = {
  body: SimulationCreateDto,
  params: UserParams,
  query: SimulationCreateQuery,
}

const SimulationsFetchQuery = v.strictObject({
  ...PaginationQuery.entries,
  ...LocaleQuery.entries,
  completedOnly: v.optional(v.pipe(v.string(), v.parseBoolean())),
})

export type SimulationsFetchQuery = v.InferOutput<typeof SimulationsFetchQuery>

export const SimulationsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: UserParams,
  query: SimulationsFetchQuery,
}

export const SimulationFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: UserSimulationParams,
  query: LocaleQuery,
}

export const OrganisationPollSimulationCreateValidator = {
  body: SimulationCreateDto,
  params: PublicPollParams,
  query: LocaleQuery,
}
