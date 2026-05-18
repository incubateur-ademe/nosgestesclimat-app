import { MODELE_URL } from '@/constants/urls/main'
import type { Locale } from '@/i18nConfig'
import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import migrationInstructions from '@incubateur-ademe/nosgestesclimat/public/migration.json'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import { migrateSituation } from '@publicodes/tools/migration'
import { captureException } from '@sentry/nextjs'
import { fetchServer } from '../fetchServer'
import type { Simulation } from './simulations'

const { ED: _, ...supportedRegionsWithoutED } = supportedRegions
export { supportedRegionsWithoutED as supportedRegions }

type ModelRegion = keyof typeof supportedRegions
export type ModelVersion = { PRNumber: string } | { publishedTag: string }
export type ModelString = `${ModelRegion}-${Locale}-${string}`
export type UserRegion = Exclude<ModelRegion, 'ED'>

export const CURRENT_MODEL_VERSION = packageJson.version
export const DEFAULT_REGION: UserRegion = 'FR'

export interface Model {
  locale: Locale
  region: ModelRegion
  version: ModelVersion
}

export function parseModelString(modelString: ModelString): Model {
  const [region, locale, versionStr] = modelString.split('-') as [
    ModelRegion,
    Locale,
    string,
  ]
  const version = /[\d]+\.[\d]+\.[\d]+/.exec(versionStr)
    ? { publishedTag: versionStr }
    : { PRNumber: versionStr.replace('pr-', '') }

  return { region, locale, version } as Model
}

export function stringifyModel(model: Model): ModelString {
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
  locale: Locale
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
