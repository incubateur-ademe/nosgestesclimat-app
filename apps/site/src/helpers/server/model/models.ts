import { MODELE_URL } from '@/constants/urls/main'
import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import { parseModelString } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import {
  type Model,
  type ModelLocale,
  type ModelRegion,
  type ModelVersion,
} from '@nosgestesclimat/core/features/simulations/types/model'
import { migrateSituation } from '@publicodes/tools/migration'
import { captureException } from '@sentry/nextjs'
import { fetchServer } from '../fetchServer'
import type { Simulation } from './simulations'

const { ED: _, ...supportedRegionsWithoutED } = supportedRegions
export { supportedRegionsWithoutED as supportedRegions }

export type { Model, ModelLocale, ModelRegion, ModelVersion }
export type UserRegion = Exclude<ModelRegion, 'ED'>

export { parseModelString }

export const CURRENT_MODEL_VERSION = packageJson.version
export const DEFAULT_REGION: UserRegion = 'FR'

export function stringifyModel(model: Model): string {
  const { region, locale, version } = model
  const versionStr =
    'publishedTag' in version ? version.publishedTag : `pr-${version.PRNumber}`
  return `${region}-${locale}-${versionStr}`
}

export function getCurrentModel({
  mode = 'standard',
  userRegion = 'FR',
  locale,
  PRNumber,
}: {
  mode?: 'scolaire' | 'standard'
  userRegion?: UserRegion
  PRNumber?: string
  locale: ModelLocale
}): Model {
  let region: Model['region'] = userRegion
  const version: ModelVersion = PRNumber
    ? { PRNumber }
    : { publishedTag: CURRENT_MODEL_VERSION }

  if (mode === 'scolaire') {
    region = 'ED'
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (mode === 'standard') {
    //
  } else {
    mode satisfies never
  }

  return {
    version,
    region,
    locale,
  }
}

export async function getGeolocation(): Promise<UserRegion> {
  try {
    const geo = await fetchServer<{ code: string; region: string }>(
      `${MODELE_URL}/geolocation`
    )
    if (geo.code in supportedRegions) {
      return geo.code as UserRegion
    }
    if (geo.region === 'Europe') {
      return 'EU'
    }
    return DEFAULT_REGION
  } catch (e) {
    captureException(e, { level: 'warning' })
    return DEFAULT_REGION
  }
}

export function migrateSimulationIfNeeded(simulation: Simulation) {
  const model = parseModelString(simulation.model)
  if (!model) return simulation

  const version = model.version
  if ('PRNumber' in version) {
    return simulation
  }
  if (version.publishedTag === CURRENT_MODEL_VERSION) {
    return simulation
  }
  simulation.situation = migrateSituation(
    simulation.situation,
    migrationInstructions
  )
  return simulation
}
