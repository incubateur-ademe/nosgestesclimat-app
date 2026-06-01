import type { Model } from '@/helpers/server/model/models'
import {
  createNewSimulation,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import type { AppUser } from '../server/dal/user'
import type { Simulation } from '../server/model/simulations'

/**
 * Ensures a simulation exists for the given user.
 * If one already exists, returns it. Otherwise creates a new one.
 *
 * Designed as a fallback for iframe/WebView contexts where
 * the anonymous session cookie doesn't persist across redirects,
 * making the normal /simulateur/commencer → /simulateur/tutoriel flow
 * unreliable.
 */
export async function ensureSimulation(
  user: AppUser,
  model: Model
): Promise<Simulation> {
  let simulation = await getCurrentSimulation({ user })

  if (!simulation) {
    await createNewSimulation({ user, model })
    simulation = await getCurrentSimulation({ user })
  }

  if (!simulation) {
    throw new Error('Failed to create or find simulation')
  }

  return simulation
}
