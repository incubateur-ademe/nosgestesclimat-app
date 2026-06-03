import type supportedRegionsType from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'

export type ModelLocale = 'fr' | 'en'

export type ModelRegion = keyof typeof supportedRegionsType

export type ModelVersion = { PRNumber: string } | { publishedTag: string }

export interface Model {
  locale: ModelLocale
  region: ModelRegion
  version: ModelVersion
}
