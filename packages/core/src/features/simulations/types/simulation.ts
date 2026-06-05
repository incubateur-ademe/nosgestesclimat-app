import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { Model } from './model.ts'

export interface Simulation {
  id: string
  date: Date
  model: Model
  progression: number
  situation: Situation<DottedName>
  createdAt: Date
  updatedAt: Date
  userId: string | null // null if the user has deleted the simulation (soft delete)
}
