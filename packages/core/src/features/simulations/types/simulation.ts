import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import type { Model } from './model.ts'

export type { Model }

export interface Simulation {
  id: string
  date: Date
  model: Model
  progression: number
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  computedResults: ComputedResults
  createdAt: Date
  updatedAt: Date
  /** null if the user has deleted the simulation (soft delete) */
  userId: string | null
}

export type SimulationMode = 'scolaire' | 'standard'
