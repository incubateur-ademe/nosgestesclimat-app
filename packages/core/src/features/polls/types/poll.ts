import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type {
  PollDefaultAdditionalQuestionType,
  PollMode,
} from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'

export interface Poll {
  id: string
  name: string
  slug: string
  mode: PollMode
  expectedNumberOfParticipants: number | null
  funFacts: FunFacts | null
  /** null when the persisted results predate the current carbone/eau shape */
  computedResults: ComputedResults | null
  defaultAdditionalQuestions: PollDefaultAdditionalQuestionType[]
  customAdditionalQuestions: unknown
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}
