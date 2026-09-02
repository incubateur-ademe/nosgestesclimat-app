import type { Simulation } from '@/helpers/server/model/simulations'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import type { Simulation as SimulationEntity } from '@nosgestesclimat/core/features/simulations/types/simulation'

export function toSimulationDto(simulation: SimulationEntity): Simulation {
  return {
    id: simulation.id,
    date: simulation.date.toISOString(),
    situation: simulation.situation,
    foldedSteps: simulation.foldedSteps,
    actionChoices: simulation.actionChoices,
    computedResults:
      simulation.computedResults as Simulation['computedResults'],
    progression: simulation.progression,
    model: serializeModel(simulation.model),
    updatedAt: simulation.updatedAt.toISOString(),
    ...(simulation.polls ? { polls: simulation.polls } : {}),
    ...(simulation.groups ? { groups: simulation.groups } : {}),
  }
}
