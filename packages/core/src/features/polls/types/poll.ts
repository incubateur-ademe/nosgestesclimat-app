import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { PollMode } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'

export interface Poll {
  id: string
  name: string
  slug: string
  mode: PollMode
  expectedNumberOfParticipants: number | null
  funFacts: FunFacts | null
  /** null until the poll's aggregated results have been computed server-side */
  computedResults: ComputedResults | null
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

export interface PollSummary {
  id: string
  name: string
  slug: string
  organisation: { slug: string }
}
