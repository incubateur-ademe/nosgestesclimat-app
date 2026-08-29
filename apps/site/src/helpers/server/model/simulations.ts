import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type {
  ComputedResults,
  Situation,
} from '../../../publicodes-state/types'

export type SimulationMode = 'scolaire' | 'standard'

export interface Simulation {
  id: string
  date: Date | string
  situation: Situation
  foldedSteps: DottedName[]
  actionChoices: Partial<Record<DottedName, boolean>>
  persona?: string
  computedResults: ComputedResults
  progression: number
  model: string
  /** @deprecated */
  user?: unknown
  polls?: { id: string; slug: string; name?: string }[]
  groups?: { id: string }[]
  /** Server-owned: absent on simulations that have not been persisted yet. */
  updatedAt?: string
}

/**
 * Tolerates an absent simulation in case the user has not taken the test yet.
 */
export function getSimulationMode(
  simulation: Pick<Simulation, 'model'> | undefined
): SimulationMode {
  return simulation?.model.startsWith('ED') ? 'scolaire' : 'standard'
}
