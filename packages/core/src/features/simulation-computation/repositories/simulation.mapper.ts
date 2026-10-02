import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { SimulationModel } from '../../../prisma/generated/models.ts'

import { SimulationInvalidModelStringError } from '../../simulations/errors/simulations.error.ts'
import { parseModelString } from '../../simulations/repository/model.mapper.ts'
import type { Simulation } from '../../simulations/types/simulation.ts'

export const mapSimulation = (db: SimulationModel): Simulation => {
  const model = parseModelString(db.model)
  if (!model) {
    throw new SimulationInvalidModelStringError(db.model, db.id)
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
