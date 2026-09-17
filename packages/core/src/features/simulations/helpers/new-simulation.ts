import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { randomUUID } from 'node:crypto'
import type { Situation } from 'publicodes'
import type { Model } from '../types/model.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import { emptyComputedResults } from './empty-computed-results.ts'

/**
 * The full set of fields needed to persist a brand-new simulation. This is the
 * shape `createSimulation` persists and the shape every fresh simulation is
 * born with.
 */
export type NewSimulation = {
  id: string
  userId: string
  model: Model
  date: Date
  progression: number
  situation: Situation<DottedName>
  foldedSteps: DottedName[]
  computedResults: ComputedResults
}

/**
 * Builds the pristine payload for a new simulation, generating a fresh `id`.
 * The caller supplies the identity + model; every other field is seeded with
 * its initial value.
 */
export const newSimulation = ({
  id = randomUUID(),
  userId,
  model,
}: {
  id?: string
  userId: string
  model: Model
}): NewSimulation => ({
  id,
  userId,
  model,
  date: new Date(),
  progression: 0,
  situation: {},
  foldedSteps: [],
  computedResults: emptyComputedResults(),
})
