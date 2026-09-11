'use server'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { importLegacyLocalSimulations } from '@nosgestesclimat/core/features/simulations/services/import-legacy-local-simulations.service'
import type { ComputedResults as CoreComputedResults } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'

/**
 * Uploads simulations found in localStorage on first authentication.
 *
 * These predate the `model` field entirely (see `LIMIT_DATE` in
 * `reconcileOnAuth`), so `ensureSimulationModel` is deliberately NOT applied
 * here: stamping them with a current model would claim they were computed with
 * rules they never ran against. They are stored with the database default
 * instead, which is truthful and keeps them out of the computation queue.
 */
export const uploadLocalSimulations = async (simulations: Simulation[]) => {
  const session = await getUserSession()
  if (!session) return

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
