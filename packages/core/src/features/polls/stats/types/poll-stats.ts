import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { ComputedResults } from '../../../simulations/validators/computed-results.schema.ts'

/**
 * What the worker computed for a poll: the sum of its participants' footprints,
 * and the fun facts that come with it. Both are written at once, hence one
 * value.
 *
 * Deliberately absent from `Poll`: a read of the poll itself must not carry
 * them, so that exposing stats always goes through the rule deciding whether
 * they may be published.
 */
export interface PollStats {
  computedResults: ComputedResults
  funFacts: FunFacts | null
}
