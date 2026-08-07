import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type {
  ComputedResults,
  Situation,
} from '../../../publicodes-state/types'

export type SimulationMode = 'scolaire' | 'standard'

export interface Simulation {
  id: string
  date: Date | string
  situation: Situation
  extendedSituation: ExtendedSituation
  foldedSteps: DottedName[]
  actionChoices: Partial<Record<DottedName, boolean>>
  persona?: string
  computedResults: ComputedResults
  progression: number
  model: string
  user?: { id: string; name?: string }
  polls?: { id: string; slug: string; name?: string }[]
  groups?: { id: string }[]
  /** Server-owned: absent on simulations that have not been persisted yet. */
  updated_at?: string
}

/**
 * Tolerates an absent simulation in case the user has not taken the test yet.
 */
export function getSimulationMode(
  simulation: Pick<Simulation, 'model'> | undefined
): SimulationMode {
  return simulation?.model.startsWith('ED') ? 'scolaire' : 'standard'
}
