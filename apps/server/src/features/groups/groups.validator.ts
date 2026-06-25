import * as v from 'valibot'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'
import { SimulationParticipantCreateDto } from '../simulations/simulations.validator.ts'

const GroupParams = v.strictObject({
  groupId: v.string(),
})

export type GroupParams = v.InferOutput<typeof GroupParams>

const UserGroupParams = v.strictObject({
  ...GroupParams.entries,
  userId: v.pipe(v.string(), v.uuid()),
})

export type UserGroupParams = v.InferOutput<typeof UserGroupParams>

const GroupParticipantParams = v.strictObject({
  ...GroupParams.entries,
  participantId: v.pipe(v.string(), v.uuid()),
})

export type GroupParticipantParams = v.InferOutput<
  typeof GroupParticipantParams
>

const GroupCreateParticipant = v.strictObject({
  simulation: SimulationParticipantCreateDto,
})

export type GroupCreateParticipant = v.InferOutput<
  typeof GroupCreateParticipant
>

const GroupCreateUser = v.strictObject({
  userId: v.pipe(v.string(), v.uuid()),
  email: v.optional(
    v.pipe(
      v.string(),
      v.email(),
      v.transform((email) => email.toLocaleLowerCase())
    )
  ),
  name: v.string(),
})

export type GroupCreateAdministrator = v.InferOutput<typeof GroupCreateUser>

const GroupCreateDto = v.strictObject({
  name: v.string(),
  emoji: v.string(),
  administrator: GroupCreateUser,
  participants: v.optional(v.strictTuple([GroupCreateParticipant])),
})

export type GroupCreateDto = v.InferOutput<typeof GroupCreateDto>

export type GroupCreateInputDto = v.InferInput<typeof GroupCreateDto>

export const GroupCreateValidator = {
  body: GroupCreateDto,
  params: v.optional(v.strictObject({})),
  query: LocaleQuery,
}

const GroupUpdateDto = v.partial(
  v.omit(GroupCreateDto, ['administrator', 'participants'])
)

export type GroupUpdateDto = v.InferOutput<typeof GroupUpdateDto>

export const GroupUpdateValidator = {
  body: GroupUpdateDto,
  params: GroupParams,
  query: LocaleQuery,
}

const ParticipantCreateDto = v.strictObject({
  ...GroupCreateUser.entries,
  ...GroupCreateParticipant.entries,
})

export type ParticipantCreateDto = v.InferOutput<typeof ParticipantCreateDto>

export type ParticipantInputCreateDto = v.InferInput<
  typeof ParticipantCreateDto
>

export const ParticipantCreateValidator = {
  body: ParticipantCreateDto,
  params: GroupParams,
  query: LocaleQuery,
}

export const ParticipantDeleteValidator = {
  body: v.optional(v.strictObject({})),
  params: GroupParticipantParams,
  query: LocaleQuery,
}

const GroupsFetchQuery = v.strictObject({
  groupIds: v.optional(v.array(v.string())),
  ...LocaleQuery.entries,
})

export type GroupsFetchQuery = v.InferOutput<typeof GroupsFetchQuery>

export const GroupsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: v.optional(v.strictObject({})),
  query: GroupsFetchQuery,
}

export const GroupFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: GroupParams,
  query: LocaleQuery,
}

export const GroupDeleteValidator = {
  body: v.optional(v.strictObject({})),
  params: UserGroupParams,
  query: LocaleQuery,
}
