import { z } from 'zod'
import { ListIds } from '../../adapters/brevo/constant.js'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
} from '../../adapters/prisma/generated.js'
import { LocaleQuery } from '../../core/i18n/lang.validator.js'
import { PaginationQuery } from '../../core/pagination.js'
import { LoginDto } from '../authentication/authentication.validator.js'
import { PublicPollParams } from '../organisations/organisations.validator.js'
import { UserParams } from '../users/users.validator.js'

const MODEL_REGEX = /^[A-Z]+-[a-z]+-\d+\.\d+\.\d+$/

const SimulationParams = z
  .object({
    simulationId: z.uuid(),
  })
  .strict()

export type SimulationParams = z.infer<typeof SimulationParams>

const UserSimulationParams = SimulationParams.extend(UserParams.shape)

export type UserSimulationParams = z.infer<typeof UserSimulationParams>

const ActionChoicesSchema = z.record(z.string(), z.boolean())

export type ActionChoicesSchema = z.infer<typeof ActionChoicesSchema>

const CategoriesSchema = z
  .object({
    alimentation: z.number(),
    transport: z.number(),
    logement: z.number(),
    divers: z.number(),
    'services sociétaux': z.number(),
  })
  .strict()

const MetricComputedResultSchema = z
  .object({
    bilan: z.number(),
    categories: CategoriesSchema,
    subcategories: z.record(z.string(), z.number()),
  })
  .strict()

export const ComputedResultSchema = z
  .object({
    carbone: MetricComputedResultSchema,
    eau: MetricComputedResultSchema,
  })
  .strict()

export type ComputedResultSchema = z.infer<typeof ComputedResultSchema>

const AdditionalQuestionsAnswersSchema = z.array(
  z.union([
    z.object({
      type: z.literal(SimulationAdditionalQuestionAnswerType.custom),
      key: z.string(),
      answer: z.string(),
    }),
    z.object({
      type: z.literal(SimulationAdditionalQuestionAnswerType.default),
      key: z.enum(PollDefaultAdditionalQuestionType),
      answer: z.string(),
    }),
  ])
)

export type AdditionalQuestionsAnswersSchema = z.infer<
  typeof AdditionalQuestionsAnswersSchema
>

const FoldedStepsSchema = z.array(z.string())

const SituationNodeValue = z.union([
  z.string(),
  z.number(),
  z
    .object({
      valeur: z.union([
        z.coerce.number(),
        z
          .string()
          .transform((s) => +s.replace(/\s/g, ''))
          .pipe(z.coerce.number()),
      ]),
      unité: z.string().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('number'),
      fullPrecision: z.boolean(),
      nodeValue: z.number(),
      nodeKind: z.literal('constant'),
      rawNode: z.number(),
      isNullable: z.boolean().optional(),
      missingVariables: z.object({}).optional(),
    })
    .strict(),
  z
    .object({
      explanation: z
        .object({
          type: z.literal('number'),
          fullPrecision: z.boolean(),
          nodeValue: z.number(),
          nodeKind: z.literal('constant'),
          rawNode: z
            .object({
              constant: z
                .object({
                  type: z.union([z.literal('constant'), z.literal('number')]),
                  nodeValue: z.number(),
                })
                .strict(),
            })
            .strict(),
          isNullable: z.boolean().optional(),
          missingVariables: z.object({}).optional(),
        })
        .strict(),
      unit: z
        .object({
          numerators: z.string(),
          denominators: z.string().optional(),
        })
        .strict(),
      nodeKind: z.literal('unité'),
      rawNode: z.string(),
    })
    .strict(),
])

const ExtendedSituationNodeValue = z
  .union([SituationNodeValue, z.boolean()])
  .nullable()

export const SituationSchema = z.record(z.string(), SituationNodeValue)

export type SituationSchema = z.infer<typeof SituationSchema>

const ExtendedSituationSchema = z.record(
  z.string(),
  z.union([
    z
      .object({
        source: z.literal('omitted'),
      })
      .strict(),
    z.object({
      source: z.union([z.literal('answered'), z.literal('default')]),
      nodeValue: ExtendedSituationNodeValue,
    }),
  ])
)

export type ExtendedSituationSchema = z.infer<typeof ExtendedSituationSchema>

const SimulationCreateUser = z
  .object({
    email: z
      .email()
      .transform((email) => email.toLocaleLowerCase())
      .optional(),
    name: z.string().optional(),
  })
  .strict()

export type SimulationCreateUser = z.infer<typeof SimulationCreateUser>

export const SimulationParticipantCreateDto = z.object({
  id: z.uuid(),
  date: z.coerce.date().default(() => new Date()),
  model: z.string().regex(MODEL_REGEX).optional(),
  progression: z.number(),
  computedResults: ComputedResultSchema,
  actionChoices: ActionChoicesSchema.default({}),
  additionalQuestionsAnswers: AdditionalQuestionsAnswersSchema.optional(),
  foldedSteps: FoldedStepsSchema.default([]),
  situation: SituationSchema,
  extendedSituation: ExtendedSituationSchema.optional(),
})

export type SimulationParticipantCreateDto = z.infer<
  typeof SimulationParticipantCreateDto
>

export type SimulationParticipantCreateInputDto = z.input<
  typeof SimulationParticipantCreateDto
>

const SimulationCreateDto = SimulationParticipantCreateDto.extend(
  z
    .object({
      user: SimulationCreateUser.optional(),
    })
    .strict().shape
)

export type SimulationCreateDto = z.infer<typeof SimulationCreateDto>

export type SimulationCreateInputDto = z.input<typeof SimulationCreateDto>

const SimulationCreateNewsletterList = z
  .union([
    z.coerce.number().pipe(z.enum(ListIds)).optional(),
    z.array(z.coerce.number().pipe(z.enum(ListIds))).optional(),
  ])
  .transform((listIds) =>
    typeof listIds === 'number' ? [listIds] : listIds || []
  )

const SimulationCreateBaseQuery = z
  .object({
    newsletters: SimulationCreateNewsletterList,
    sendEmail: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })
  .extend(LocaleQuery.shape)
  .strict()

const SimulationCreateLoginQuery = LoginDto.omit({
  userId: true,
}).extend(SimulationCreateBaseQuery.shape)

const SimulationCreateAnonymousQuery = z
  .object({
    email: z.undefined().optional(),
    code: z.undefined().optional(),
  })
  .extend(SimulationCreateBaseQuery.shape)

const SimulationCreateQuery = z.union([
  SimulationCreateLoginQuery,
  SimulationCreateAnonymousQuery,
])

export type SimulationCreateQuery = z.infer<typeof SimulationCreateQuery>

export const SimulationCreateValidator = {
  body: SimulationCreateDto,
  params: UserParams,
  query: SimulationCreateQuery,
}

const SimulationsFetchQuery = PaginationQuery.extend(LocaleQuery.shape).extend({
  completedOnly: z.stringbool().optional(),
})

export type SimulationsFetchQuery = z.infer<typeof SimulationsFetchQuery>

export const SimulationsFetchValidator = {
  body: z.object({}).strict().optional(),
  params: UserParams,
  query: SimulationsFetchQuery,
}

export const SimulationFetchValidator = {
  body: z.object({}).strict().optional(),
  params: UserSimulationParams,
  query: LocaleQuery,
}

export const OrganisationPollSimulationCreateValidator = {
  body: SimulationCreateDto,
  params: PublicPollParams,
  query: LocaleQuery,
}
