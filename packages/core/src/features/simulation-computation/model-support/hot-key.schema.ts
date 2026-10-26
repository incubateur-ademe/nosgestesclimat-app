import * as v from 'valibot'
import {
  CURRENT_MODEL_VERSION,
  parseModelVersion,
} from '../../models/helpers/model-versions.ts'
import {
  ModelRegionSchema,
  type ModelVersion,
} from '../../models/types/model.ts'

/**
 * `current` resolves to the model version installed in node_modules, so a
 * model release never requires touching `ENGINE_HOT_KEYS` in an environment.
 */
const VersionSchema = v.pipe(
  v.string(),
  v.rawTransform<string, ModelVersion>(({ dataset, addIssue, NEVER }) => {
    const version =
      dataset.value === 'current'
        ? { publishedTag: CURRENT_MODEL_VERSION }
        : parseModelVersion(dataset.value)

    if (!version) {
      addIssue({
        message: 'Expected "current", a published tag or "pr-{number}"',
      })
      return NEVER
    }

    return version
  })
)

/**
 * Parses an `ENGINE_HOT_KEYS` entry, formatted as `{region}:{version}`
 * (e.g. `FR:current`, `FR:4.14.2`, `FR:pr-1234`), into its typed parts.
 */
export const HotKeySchema = v.pipe(
  v.string(),
  v.transform((rawKey) => rawKey.split(':')),
  v.strictTuple([ModelRegionSchema, VersionSchema]),
  v.transform(([region, version]) => ({ region, version }))
)

export type HotKey = v.InferOutput<typeof HotKeySchema>
