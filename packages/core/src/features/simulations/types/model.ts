import type supportedRegionsType from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import * as v from 'valibot'
import { parseModelString } from '../repository/model.mapper.ts'

export const ModelLocaleSchema = v.picklist(['fr', 'en'])

export type ModelLocale = v.InferOutput<typeof ModelLocaleSchema>

export const ModelRegionSchema = v.picklist(
  Object.keys(supportedRegions) as (keyof typeof supportedRegionsType)[]
)

export type ModelRegion = v.InferOutput<typeof ModelRegionSchema>

export const ModelVersionSchema = v.union([
  v.strictObject({ publishedTag: v.string() }),
  v.strictObject({ PRNumber: v.string() }),
])

export type ModelVersion = v.InferOutput<typeof ModelVersionSchema>

export const ModelSchema = v.strictObject({
  locale: ModelLocaleSchema,
  region: ModelRegionSchema,
  version: ModelVersionSchema,
})

export type Model = v.InferOutput<typeof ModelSchema>

/**
 * Serialized model string stored in the database (e.g. `FR-fr-1.0.0`).
 */
export const ModelStringSchema = v.pipe(
  v.string(),
  v.custom<ModelString>((data) => !!parseModelString(String(data)))
)

export type ModelString = string & { __brand: 'ModelString' }
