import type { Locale } from '@/i18nConfig'
import type { AppUser } from '@/helpers/server/dal/user'
import type { Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { headers } from 'next/headers'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { ensureSimulation } from './ensureSimulation'
import { isSafariIframe } from './isSafariIframe'

type GetModelFn = () => Promise<Model>

async function getOrCreateInSafariIframe(
  user: AppUser,
  getModel: GetModelFn
): Promise<Simulation | undefined> {
  const head = await headers()
  if (!isSafariIframe(head)) return undefined
  return ensureSimulation(user, await getModel())
}

/**
 * Safari iframe fallback for the tutorial page.
 * Creates a simulation inline when the anonymous session cookie
 * doesn't survive the redirect from /simulateur/commencer.
 */
export async function handleSafariIframeTutorial(
  user: AppUser,
  searchParams: Promise<SearchParams>,
  locale: Locale
): Promise<Simulation | undefined> {
  return getOrCreateInSafariIframe(user, async () => {
    const { getNewSimulationModelService } = await import(
      '@/app/[locale]/simulateur/_service/getNewSimulationModelService'
    )
    return getNewSimulationModelService({ searchParams, locale })
  })
}

/**
 * Safari iframe fallback for the simulator layout.
 * Prevents the infinite redirect loop when the cookie is lost
 * between /simulateur/tutoriel and /simulateur/bilan.
 */
export async function handleSafariIframeSimulator(
  user: AppUser,
  locale: Locale
): Promise<Simulation | undefined> {
  return getOrCreateInSafariIframe(user, async () => {
    const { getNewSimulationModelService } = await import(
      '@/app/[locale]/simulateur/_service/getNewSimulationModelService'
    )
    return getNewSimulationModelService({
      searchParams: Promise.resolve({}),
      locale,
    })
  })
}
