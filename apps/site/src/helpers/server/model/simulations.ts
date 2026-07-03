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
  polls?: { id: string; slug: string }[]
  groups?: { id: string }[]
  updated_at: string
}

export function getSimulationMode(simulation: Simulation): SimulationMode {
  return simulation.model.startsWith('ED') ? 'scolaire' : 'standard'
}
