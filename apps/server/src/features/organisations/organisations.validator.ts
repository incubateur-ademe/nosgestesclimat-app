import {
  OrganisationType,
  PollDefaultAdditionalQuestionType,
  PollMode,
} from '@nosgestesclimat/core/prisma/generated/enums'
import * as v from 'valibot'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'
import { PaginationQuery } from '../../core/pagination.ts'

const OrganisationParams = v.strictObject({
  organisationIdOrSlug: v.string(),
})

export type OrganisationParams = v.InferOutput<typeof OrganisationParams>

const PollParams = v.strictObject({
  pollIdOrSlug: v.string(),
})

export type PollParams = v.InferOutput<typeof PollParams>

const OrganisationPollParams = v.strictObject({
  ...OrganisationParams.entries,
  ...PollParams.entries,
})

export type OrganisationPollParams = v.InferOutput<
  typeof OrganisationPollParams
>

export const PublicPollParams = v.strictObject({
  ...PollParams.entries,
})

export type PublicPollParams = v.InferOutput<typeof PublicPollParams>

const OrganisationCreateAdministrator = v.strictObject({
  name: v.optional(v.nullable(v.string())),
  telephone: v.optional(v.nullable(v.string())),
  position: v.optional(v.nullable(v.string())),
  optedInForCommunications: v.optional(v.boolean()),
})

export type OrganisationCreateAdministrator = v.InferOutput<
  typeof OrganisationCreateAdministrator
>

const OrganisationCreateDto = v.strictObject({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  type: v.optional(v.enum(OrganisationType)),
  administrators: v.optional(v.strictTuple([OrganisationCreateAdministrator])),
  numberOfCollaborators: v.optional(v.nullable(v.number())),
})

export type OrganisationCreateDto = v.InferOutput<typeof OrganisationCreateDto>

export const OrganisationCreateValidator = {
  body: OrganisationCreateDto,
  params: v.optional(v.strictObject({})),
  query: LocaleQuery,
}

const OrganisationUpdateAdministrator = v.strictObject({
  ...OrganisationCreateAdministrator.entries,
  email: v.optional(
    v.pipe(
      v.string(),
      v.email(),
      v.transform((email: string) => email.toLocaleLowerCase())
    )
  ),
})

export type OrganisationUpdateAdministrator = v.InferOutput<
  typeof OrganisationUpdateAdministrator
>

const OrganisationUpdateDto = v.partial(
  v.strictObject({
    ...OrganisationCreateDto.entries,
    administrators: v.optional(
      v.strictTuple([OrganisationUpdateAdministrator])
    ),
  })
)

export type OrganisationUpdateDto = v.InferOutput<typeof OrganisationUpdateDto>

const OrganisationUpdateQuery = v.strictObject({
  code: v.optional(v.pipe(v.string(), v.regex(/^\d{6}$/))),
  ...LocaleQuery.entries,
})

export type OrganisationUpdateQuery = v.InferOutput<
  typeof OrganisationUpdateQuery
>

export const OrganisationUpdateValidator = {
  body: OrganisationUpdateDto,
  params: OrganisationParams,
  query: OrganisationUpdateQuery,
}

const OrganisationsFetchQuery = v.strictObject({
  ...PaginationQuery.entries,
  ...LocaleQuery.entries,
})

export type OrganisationsFetchQuery = v.InferOutput<
  typeof OrganisationsFetchQuery
>

export const OrganisationsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: v.optional(v.strictObject({})),
  query: OrganisationsFetchQuery,
}

export const OrganisationFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: OrganisationParams,
  query: LocaleQuery,
}

const OrganisationPollCustomAdditionalQuestion = v.strictObject({
  question: v.string(),
  isEnabled: v.boolean(),
})

export type OrganisationPollCustomAdditionalQuestion = v.InferOutput<
  typeof OrganisationPollCustomAdditionalQuestion
>

export const OrganisationPollCustomAdditionalQuestions = v.array(
  OrganisationPollCustomAdditionalQuestion
)

const MAX_CUSTOM_ADDITIONAL_QUESTIONS = 4

const OrganisationPollCreateDto = v.strictObject({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(150)),
  expectedNumberOfParticipants: v.optional(v.nullable(v.number())),
  defaultAdditionalQuestions: v.optional(
    v.nullable(v.array(v.enum(PollDefaultAdditionalQuestionType)))
  ),
  customAdditionalQuestions: v.optional(
    v.nullable(
      v.pipe(
        v.array(OrganisationPollCustomAdditionalQuestion),
        v.maxLength(MAX_CUSTOM_ADDITIONAL_QUESTIONS)
      )
    )
  ),
  mode: v.optional(v.enum(PollMode), PollMode.standard),
})

export type OrganisationPollCreateDto = v.InferOutput<
  typeof OrganisationPollCreateDto
>

export const OrganisationPollCreateValidator = {
  body: OrganisationPollCreateDto,
  params: OrganisationParams,
  query: LocaleQuery,
}

const OrganisationPollUpdateDto = v.partial(OrganisationPollCreateDto)

export type OrganisationPollUpdateDto = v.InferOutput<
  typeof OrganisationPollUpdateDto
>

const OrganisationPollSimulationsDownloadQuery = v.strictObject({
  jobId: v.optional(v.string()),
  ...LocaleQuery.entries,
})

export const OrganisationPollUpdateValidator = {
  body: OrganisationPollUpdateDto,
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollDeleteValidator = {
  body: v.optional(v.strictObject({})),
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: OrganisationParams,
  query: LocaleQuery,
}

export const OrganisationPollFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: OrganisationPollParams,
  query: LocaleQuery,
}

export const OrganisationPollSimulationsDownloadValidator = {
  body: v.optional(v.strictObject({})),
  params: OrganisationPollParams,
  query: OrganisationPollSimulationsDownloadQuery,
}

export const OrganisationPublicPollFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: PublicPollParams,
  query: LocaleQuery,
}

export const OrganisationPublicPollSimulationsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: PublicPollParams,
  query: LocaleQuery,
}

export const OrganisationPublicPollDashboardValidator = {
  body: v.optional(v.strictObject({})),
  params: PublicPollParams,
  query: LocaleQuery,
}
