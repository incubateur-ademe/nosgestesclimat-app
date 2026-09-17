import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { SimulationModel } from '../../../prisma/generated/models.ts'
import { InvalidModelString } from '../../simulations/exceptions/simulations.exception.ts'

import { parseModelString } from '../../simulations/repository/model.mapper.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'

export const mapSimulation = (db: SimulationModel): Simulation => {
  const model = parseModelString(db.model)
  if (!model) {
    throw new InvalidModelString({
      simulationId: db.id,
      modelString: db.model,
    })
  }

  return {
    id: db.id,
    date: db.date,
    progression: db.progression,
    model,
    situation: db.situation as Situation<DottedName>,
    foldedSteps: db.foldedSteps as DottedName[],
    computedResults: db.computedResults as Simulation['computedResults'],
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    userId: db.userId,
  }
}
