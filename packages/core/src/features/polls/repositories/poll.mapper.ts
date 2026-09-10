import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { JsonValue } from '@prisma/client/runtime/client'
import * as v from 'valibot'
import type {
  PollDefaultAdditionalQuestionType,
  PollMode,
} from '../../../prisma/generated/client.ts'
import { ComputedResultsSchema } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll } from '../types/poll.ts'

export interface PollRow {
  id: string
  name: string
  slug: string
  mode: PollMode
  organisationId: string
  expectedNumberOfParticipants: number | null
  funFacts: JsonValue | null
  computedResults: unknown
  customAdditionalQuestions: unknown
  defaultAdditionalQuestions: { type: PollDefaultAdditionalQuestionType }[]
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

export const toPoll = (row: PollRow): Poll => {
  const computedResults = v.safeParse(
    ComputedResultsSchema,
    row.computedResults
  )

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    mode: row.mode,
    expectedNumberOfParticipants: row.expectedNumberOfParticipants,
    funFacts: (row.funFacts as FunFacts | null) ?? null,
    computedResults: computedResults.success ? computedResults.output : null,
    defaultAdditionalQuestions: row.defaultAdditionalQuestions.map(
      ({ type }) => type
    ),
    customAdditionalQuestions: row.customAdditionalQuestions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    organisation: row.organisation,
  }
}
