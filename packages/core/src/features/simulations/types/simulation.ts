import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'
import type { Model } from './model.ts'

export interface Simulation {
  id: string
  date: Date
  model: Model
  progression: number
  situation: Situation<DottedName>
  extendedSituation: ExtendedSituation | null
  foldedSteps: DottedName[]
  actionChoices: Partial<Record<DottedName, boolean>>
  computedResults: ComputedResultSchema
  createdAt: Date
  updatedAt: Date
  /** null if the user has deleted the simulation (soft delete) */
  userId: string | null
  /** Only hydrated when the read includes them. */
  polls?: { id: string; slug: string; name: string }[]
  /** Only hydrated when the read includes them. */
  groups?: { id: string }[]
}
