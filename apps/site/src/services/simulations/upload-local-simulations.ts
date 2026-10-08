'use server'

import type { Simulation } from '@/helpers/server/model/simulations'
import logger from '@/logger/logger.server'
import { getUserSession } from '@/services/auth/get-user-session'
import { importLegacyLocalSimulations } from '@nosgestesclimat/core/features/simulations/services/import-legacy-local-simulations.service'
import type { ComputedResults as CoreComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'

/** Uploads localStorage simulations on first auth. Pre-dates the `model` field,
 * so `ensureSimulationModel` is NOT applied: stamping a current model would
 * lie about what rules computed them. Stored with the database default instead. */
export const uploadLocalSimulations = async (simulations: Simulation[]) => {
  const session = await getUserSession()
  if (!session) return
  logger.info('Uploading local simulations', {
    userId: session.id,
    simulationCount: simulations.length,
  })
  await importLegacyLocalSimulations({
    userId: session.id,
    // `computedResults` has already been validated by
    // `hasValidComputedResults` in `reconcileOnAuth`; the site and core types
    // differ structurally (index signatures vs. strict schema) but are
    // compatible at runtime.
    simulations: simulations.map((simulation) => ({
      ...simulation,
      computedResults:
        simulation.computedResults as unknown as CoreComputedResults,
    })),
  })
}
