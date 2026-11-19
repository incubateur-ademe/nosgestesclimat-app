import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import type { Model } from '../../models/types/model.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

export type { Model }

export interface Simulation {
  id: string
  date: Date
  model: Model
  progression: number
  status: SimulationStatus
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  computedResults: ComputedResults
  createdAt: Date
  updatedAt: Date
  /** null if the user has deleted the simulation (soft delete) */
  userId: string | null
}

export type SimulationMode = 'scolaire' | 'standard'

export type SimulationStatus =
  | 'not_started'
  | 'answering_major_questions'
  | 'major_questions_result_seen'
  | 'answering_minor_questions'
  | 'full_result_seen'
