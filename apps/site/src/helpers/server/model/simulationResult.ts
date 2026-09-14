import type {
  SimulationResultGroupInfo,
  Tendency,
} from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'

import type { Simulation } from '@/helpers/server/model/simulations'

export interface SimulationResult {
  simulation: Simulation
  group: SimulationResultGroupInfo | null
  tendency: Tendency | null
}
