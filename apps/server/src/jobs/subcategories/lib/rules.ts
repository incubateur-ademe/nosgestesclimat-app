/**
 * Catalogue of the sub-category rule sets by model version range, plus version
 * helpers.
 *
 * The files live in [`./rules`](./rules) and are the source of truth: the
 * published model (`@incubateur-ademe/nosgestesclimat`) contains no
 * `bilan . sous catégories` rule, so they cannot be extracted from it.
 *
 * The base file defines the CSV columns. A variant must **never** introduce a
 * rule absent from that file, otherwise the columns would depend on the model
 * version (`findExtraRules`).
 */

import { getModelFromSource } from '@publicodes/tools/compilation'
import { existsSync } from 'node:fs'
import path from 'node:path'

/** Base file: it defines the structure (and therefore the CSV columns). */
export const BASE_RULES_FILE = 'subcategories.yaml'

const RULES_DIR = path.join(import.meta.dirname, '..', 'rules')

/** Absolute path of a rules file. */
export const rulesPath = (file: string) => path.join(RULES_DIR, file)

export type RulesSet = {
  /** Lowest version, included. */
  min: string
  /** Highest version, excluded (`null` = no bound). */
  maxExclusive: string | null
  /**
   * Files to merge, in order. The first one defines the structure, the next ones
   * override existing rules.
   */
  files: string[]
}

const before416 = 'subcategories.before-4.16.0.yaml'
const before4101 = 'subcategories.before-4.10.1.yaml'
const before4100 = 'subcategories.before-4.10.0.yaml'
const before491 = 'subcategories.before-4.9.1.yaml'

/**
 * A version matching no range is skipped (reason "unsupported version"), never
 * counted as an error.
 */
export const RULES_SETS: RulesSet[] = [
  { min: '4.16.0', maxExclusive: null, files: [BASE_RULES_FILE] },
  {
    // Breakfast reworked in 4.16.0: aggregated profile before, components after.
    min: '4.10.1',
    maxExclusive: '4.16.0',
    files: [BASE_RULES_FILE, before416],
  },
  {
    // 4.10.0: `consommation totale hors individuel` does not exist yet, it is
    // `consommation totale collectif`.
    min: '4.10.0',
    maxExclusive: '4.10.1',
    files: [BASE_RULES_FILE, before416, before4101],
  },
  {
    // Before 4.10.0: neither `chauffage . mode` nor `. principal`, and the
    // average car of the model uses the `berline` template, not `moyenne`.
    min: '4.9.1',
    maxExclusive: '4.10.0',
    files: [BASE_RULES_FILE, before416, before4101, before4100],
  },
  {
    // Before 4.9.1: `empreinte branche . <code> par hab . services publics`
    // does not exist, the NAF breakdown is impossible (leaves at 0, model
    // aggregates).
    min: '4.6.0',
    maxExclusive: '4.9.1',
    files: [BASE_RULES_FILE, before416, before4101, before4100, before491],
  },
]

/**
 * `X`, `Y` and `Z` of a version, ignoring any pre-release suffix
 * (`Number('0-rc')` would be `NaN` and silently match nothing).
 */
const numericParts = (version: string) =>
  String(version)
    .split('.')
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0)

const preReleaseOf = (version: string): string | null => {
  const match = /^\d+\.\d+\.\d+-(.+)$/.exec(String(version))
  return match ? match[1] : null
}

/**
 * Orders two versions the way npm does: a pre-release comes before its release
 * (`4.13.0-rc.2` < `4.13.0`), and two pre-releases compare by suffix.
 */
export const compareVersions = (a: string, b: string): number => {
  const pa = numericParts(a)
  const pb = numericParts(b)
  for (let i = 0; i < 3; i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x - y
  }

  const sa = preReleaseOf(a)
  const sb = preReleaseOf(b)
  if (sa === sb) return 0
  if (sa == null) return 1
  if (sb == null) return -1
  return sa < sb ? -1 : 1
}

/**
 * A pre-release belongs to the era *before* its release: `4.16.0-rc.1` was
 * published while the model still had the pre-4.16.0 breakfast, so it must not
 * inherit the rules of 4.16.0.
 */
const isVersionInRange = (version: string, set: RulesSet): boolean =>
  compareVersions(version, set.min) >= 0 &&
  (set.maxExclusive == null || compareVersions(version, set.maxExclusive) < 0)

/** Rules set applying to a version, or `null` if unsupported. */
export const getRulesSet = (version: string): RulesSet | null =>
  RULES_SETS.find((set) => isVersionInRange(version, set)) ?? null

/**
 * A model version is `X.Y.Z`, optionally followed by a pre-release
 * (`4.13.0-rc.2`). `pr-2824` (ephemeral `pkg-pr-new` packages, not on the npm
 * registry) is not a version.
 */
const VERSION_RE = /^\d+\.\d+\.\d+(?:-\w[\w.]*)?$/

/** True when the `model` field carries a version, pre-release included. */
export const isVersionString = (version: string): boolean =>
  VERSION_RE.test(String(version))

/**
 * Extracts the model version from the `model` field, pre-release included:
 * `FR-fr-4.17.0` → `4.17.0`, `FR-fr-4.13.0-rc.2` → `4.13.0-rc.2`.
 */
export const getVersionFromModel = (model: string): string =>
  model.split('-').slice(2).join('-')

/** SQL equivalent of `getVersionFromModel`, applied to `s.model`. */
export const SQL_VERSION = `substring(s.model from '^[^-]+-[^-]+-(.*)$')`

/** Loads and merges the files of a rules set. */
const loadFiles = (files: string[]): Record<string, unknown> =>
  Object.assign(
    {},
    ...files.map((file) => getModelFromSource([rulesPath(file)]))
  ) as Record<string, unknown>

const rulesBySetCache = new Map<string, Record<string, unknown>>()

/** Sub-category rules of a version, or `null` if unsupported. */
export const getSubcategoryRules = (
  version: string
): Record<string, unknown> | null => {
  const set = getRulesSet(version)
  if (!set) return null

  const key = set.files.join('|')
  if (!rulesBySetCache.has(key)) {
    rulesBySetCache.set(key, loadFiles(set.files))
  }
  return rulesBySetCache.get(key) ?? null
}

/** Rules of the base file (defines the CSV columns). */
export const getBaseRules = (): Record<string, unknown> =>
  loadFiles([BASE_RULES_FILE])

/**
 * A rule is "empty" when it has neither `formule` nor `valeur`: a plain tree
 * node, excluded from the CSV columns.
 */
export const isEmptyRule = (rule: unknown): boolean => {
  if (rule == null || typeof rule !== 'object') return true
  const { formule: formula, valeur: value } = rule as {
    formule?: unknown
    valeur?: unknown
  }
  return formula === undefined && value === undefined
}

/**
 * Files referenced by `RULES_SETS` that are missing on disk. `getModelFromSource`
 * silently returns an empty model for a missing file, so a renamed variant would
 * otherwise be skipped without any error.
 */
export const findMissingRuleFiles = (): string[] =>
  [...new Set(RULES_SETS.flatMap((set) => set.files))].filter(
    (file) => !existsSync(rulesPath(file))
  )

/**
 * Checks that no variant introduces a rule absent from the base file. Without
 * this guard the CSV columns would vary between model versions. Returns the
 * offending files (empty when all is well).
 */
export const findExtraRules = (baseRules: Record<string, unknown>) => {
  const baseNames = Object.keys(baseRules)
  const problems: { file: string; extra: string[] }[] = []

  for (const set of RULES_SETS) {
    for (const file of set.files.slice(1)) {
      const extra = Object.keys(loadFiles([file])).filter(
        (name) => !baseNames.includes(name)
      )
      if (extra.length > 0) problems.push({ file, extra })
    }
  }
  return problems
}

/** Readable label of the rules set applied to a version. */
export const rulesSetLabel = (version: string): string => {
  if (!isVersionString(version)) return 'not a version'
  const set = getRulesSet(version)
  if (!set) return 'UNSUPPORTED'
  if (set.files.length === 1) return 'base'
  return set.files
    .slice(1)
    .map((file) => file.replace(/^subcategories\./, '').replace(/\.ya?ml$/, ''))
    .join('+')
}
