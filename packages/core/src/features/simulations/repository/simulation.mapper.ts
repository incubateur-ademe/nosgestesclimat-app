import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { SimulationModel } from '../../../prisma/generated/models.ts'
import { InvalidModelString } from '../exceptions/simulations.exception.ts'

import type { Simulation } from '../types/simulation.ts'
import { parseModelString } from './model.mapper.ts'

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
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    userId: db.userId,
  }
}
