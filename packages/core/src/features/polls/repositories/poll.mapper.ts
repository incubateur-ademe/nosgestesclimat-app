import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import * as v from 'valibot'
import { ComputedResultsSchema } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll } from '../types/poll.ts'
import type { PollRow } from './poll.repository.ts'

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
