import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { ComputedResult } from './computed-result.ts'

export interface Simulation {
  id: string
  date: Date
  model: string
  progression: number
  computedResults: ComputedResult
  foldedSteps: string[]
  situation: Situation<DottedName>
  extendedSituation: ExtendedSituation | null
  createdAt: Date
  updatedAt: Date
  userId: string | null // null if the user has deleted the simulation (soft delete)
}

export type NewSimulation = Pick<
  Simulation,
  | 'id'
  | 'model'
  | 'situation'
  | 'extendedSituation'
  | 'progression'
  | 'computedResults'
  | 'foldedSteps'
>

export type UpdatedSimulation = NewSimulation
