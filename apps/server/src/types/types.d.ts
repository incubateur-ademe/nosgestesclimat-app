/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'
import type { CustomAdditionalQuestionType } from '../schemas/PollSchema.js'

declare global {
  namespace Express {
    export interface Request {
      user?: { userId: string; email: string }
      apiUser?: { scopes: Set<string>; email: string }
      clientIp: string
      requestParams: string
    }
  }
}

export type PollPublicInfo = {
  name?: string
  slug: string
  defaultAdditionalQuestions?: string[]
  customAdditionalQuestions?: CustomAdditionalQuestionType[]
  expectedNumberOfParticipants?: number
  numberOfParticipants: number
  organisationInfo?: OrganisationInfo
  startDate?: string
  endDate?: string
}

type OrganisationInfo = {
  name?: string
  slug?: string
}

export type Situation = {
  [key: string]: NodeValue
}

export type WithRequiredProperty<Type, Keys extends keyof Type> = Type & {
  [Property in Keys]-?: Type[Property]
}

export type WithOptionalProperty<T, O extends keyof T> = Pick<
  T,
  Exclude<keyof T, O>
> &
  Partial<{ [P in O]: T[P] }>

type ValueToDto<T> = T extends Function
  ? never
  : T extends Date
    ? string
    : T extends Map<infer Key, infer Value>
      ? Record<Key, ModelToDto<Value>>
      : T extends object
        ? ModelToDto<T>
        : T

export type ModelToDto<T> = {
  [key in keyof T]: ValueToDto<T[key]>
}

export type Metric = 'carbone' | 'eau'

export type ValueOf<T> = T[keyof T]
