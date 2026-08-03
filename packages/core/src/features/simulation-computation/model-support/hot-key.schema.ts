import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import * as v from 'valibot'
import type { ModelRegion } from '../../simulations/types/model.ts'
import type { ModelVersionKind } from './model-versions.ts'

const RegionSchema = v.picklist(Object.keys(supportedRegions) as ModelRegion[])

const VersionKindSchema = v.picklist([
  'current',
  'previous',
] as const satisfies readonly ModelVersionKind[])

/**
 * Parses an `ENGINE_HOT_KEYS` entry, formatted as `{region}:{version}`
 * (e.g. `FR:current`), into its typed parts.
 */
export const HotKeySchema = v.pipe(
  v.string(),
  v.transform((rawKey) => rawKey.split(':')),
  v.strictTuple([RegionSchema, VersionKindSchema]),
  v.transform(([region, versionKind]) => ({ region, versionKind }))
)

export type HotKey = v.InferOutput<typeof HotKeySchema>
