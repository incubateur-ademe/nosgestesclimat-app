import { z } from 'zod'
import {
  OrganisationType,
  PollDefaultAdditionalQuestionType,
  PollMode,
} from '../../adapters/prisma/generated.js'
import { LocaleQuery } from '../../core/i18n/lang.validator.js'
import { PaginationQuery } from '../../core/pagination.js'
import { UserParams } from '../users/users.validator.js'

const OrganisationParams = z
  .object({
    organisationIdOrSlug: z.string(),
  })
  .strict()

export type OrganisationParams = z.infer<typeof OrganisationParams>

const PollParams = z
  .object({
    pollIdOrSlug: z.string(),
  })
  .strict()

export type PollParams = z.infer<typeof PollParams>

const OrganisationPollParams = OrganisationParams.extend(PollParams.shape)

export type OrganisationPollParams = z.infer<typeof OrganisationPollParams>

export const PublicPollParams = UserParams.extend(PollParams.shape)

export type PublicPollParams = z.infer<typeof PublicPollParams>

const OrganisationCreateAdministrator = z
  .object({
    name: z.string().optional().nullable(),
    telephone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    optedInForCommunications: z.boolean().optional(),
  })
  .strict()

export type OrganisationCreateAdministrator = z.infer<
  typeof OrganisationCreateAdministrator
>

const OrganisationCreateDto = z
  .object({
    name: z.string().min(1).max(100),
    type: z.enum(OrganisationType).optional(),
    administrators: z.tuple([OrganisationCreateAdministrator]).optional(),
    numberOfCollaborators: z.number().optional().nullable(),
  })
  .strict()

export type OrganisationCreateDto = z.infer<typeof OrganisationCreateDto>

export const OrganisationCreateValidator = {
  body: OrganisationCreateDto,
  params: z.object({}).strict().optional(),
  query: LocaleQuery,
}

const OrganisationUpdateAdministrator = OrganisationCreateAdministrator.extend(
  z
    .object({
      email: z
        .email()
        .transform((email) => email.toLocaleLowerCase())
        .optional(),
    })
    .strict().shape
)

export type OrganisationUpdateAdministrator = z.infer<
  typeof OrganisationUpdateAdministrator
>

const OrganisationUpdateDto = OrganisationCreateDto.extend(
  z
    .object({
      administrators: z.tuple([OrganisationUpdateAdministrator]).optional(),
    })
    .strict().shape
)
  .partial()
  .strict()

export type OrganisationUpdateDto = z.infer<typeof OrganisationUpdateDto>

const OrganisationUpdateQuery = z
  .object({
    code: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
  })
  .extend(LocaleQuery.shape)
  .strict()

export type OrganisationUpdateQuery = z.infer<typeof OrganisationUpdateQuery>

export const OrganisationUpdateValidator = {
  body: OrganisationUpdateDto,
  params: OrganisationParams,
  query: OrganisationUpdateQuery,
}

const OrganisationsFetchQuery = PaginationQuery.extend(LocaleQuery.shape)

export type OrganisationsFetchQuery = z.infer<typeof OrganisationsFetchQuery>

export const OrganisationsFetchValidator = {
  body: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
  query: OrganisationsFetchQuery,
}

export const OrganisationFetchValidator = {
  body: z.object({}).strict().optional(),
  params: OrganisationParams,
  query: LocaleQuery,
}

const OrganisationPollCustomAdditionalQuestion = z
  .object({
    question: z.string(),
    isEnabled: z.boolean(),
  })
  .strict()

export type OrganisationPollCustomAdditionalQuestion = z.infer<
  typeof OrganisationPollCustomAdditionalQuestion
>

export const OrganisationPollCustomAdditionalQuestions = z.array(
  OrganisationPollCustomAdditionalQuestion
)

const MAX_CUSTOM_ADDITIONAL_QUESTIONS = 4

const OrganisationPollCreateDto = z
  .object({
    name: z.string().min(1).max(150),
    expectedNumberOfParticipants: z.number().optional().nullable(),
    defaultAdditionalQuestions: z
      .array(z.enum(PollDefaultAdditionalQuestionType))
      .optional()
      .nullable(),
    customAdditionalQuestions: z
      .array(OrganisationPollCustomAdditionalQuestion)
      .max(MAX_CUSTOM_ADDITIONAL_QUESTIONS)
      .optional()
      .nullable(),
    mode: z.nativeEnum(PollMode).optional().default(PollMode.standard),
  })
  .strict()

export type OrganisationPollCreateDto = z.infer<
  typeof OrganisationPollCreateDto
>

export const OrganisationPollCreateValidator = {
  body: OrganisationPollCreateDto,
  params: OrganisationParams,
  query: LocaleQuery,
}

const OrganisationPollUpdateDto = OrganisationPollCreateDto.partial()

export type OrganisationPollUpdateDto = z.infer<
  typeof OrganisationPollUpdateDto
>

const OrganisationPollSimulationsDownloadQuery = z
  .object({
    jobId: z.string().optional(),
  })
  .extend(LocaleQuery.shape)
  .strict()

export const OrganisationPollUpdateValidator = {
  body: OrganisationPollUpdateDto,
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollDeleteValidator = {
  body: z.object({}).strict().optional(),
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollsFetchValidator = {
  body: z.object({}).strict().optional(),
  params: OrganisationParams,
  query: LocaleQuery,
}

export const OrganisationPollFetchValidator = {
  body: z.object({}).strict().optional(),
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollSimulationsDownloadValidator = {
  body: z.object({}).strict().optional(),
  params: OrganisationPollParams,
  query: OrganisationPollSimulationsDownloadQuery,
}

export const OrganisationPublicPollFetchValidator = {
  body: z.object({}).strict().optional(),
  params: PublicPollParams,
  query: LocaleQuery,
}

export const OrganisationPublicPollSimulationsFetchValidator = {
  body: z.object({}).strict().optional(),
  params: PublicPollParams,
  query: LocaleQuery,
}

export const OrganisationPublicPollDashboardValidator = {
  body: z.object({}).strict().optional(),
  params: PublicPollParams,
  query: LocaleQuery,
}
