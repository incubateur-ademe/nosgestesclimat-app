/**
 * Catalogue des jeux de règles de sous catégories, par plage de versions du
 * modèle, et helpers de version.
 *
 * Les fichiers vivent dans [`./rules`](./rules) et font foi : le modèle publié
 * (`@incubateur-ademe/nosgestesclimat`) ne contient aucune règle
 * `bilan . sous catégories`, elles ne peuvent donc pas en être extraites.
 *
 * Le fichier de base définit les colonnes du CSV. Une variante ne doit
 * **jamais** introduire de règle absente de ce fichier, sinon les colonnes
 * dépendraient de la version du modèle (`findExtraRules`).
 */

import { getModelFromSource } from '@publicodes/tools/compilation'
import path from 'node:path'

/** Fichier de base : il définit la structure (et donc les colonnes du CSV). */
export const BASE_RULES_FILE = 'subcategories.yaml'

const RULES_DIR = path.join(import.meta.dirname, '..', 'rules')

/** Chemin absolu d'un fichier de règles. */
export const rulesPath = (file: string) => path.join(RULES_DIR, file)

export type RulesSet = {
  /** Version minimale, incluse. */
  min: string
  /** Version maximale, exclue (`null` = pas de borne). */
  maxExclusive: string | null
  /**
   * Fichiers à fusionner, dans l'ordre. Le premier définit la structure, les
   * suivants surchargent des règles existantes.
   */
  files: string[]
}

const before416 = 'subcategories.avant-4.16.0.yaml'
const before4101 = 'subcategories.avant-4.10.1.yaml'
const before4100 = 'subcategories.avant-4.10.0.yaml'
const before491 = 'subcategories.avant-4.9.1.yaml'

/**
 * Une version qui ne tombe dans aucune plage est ignorée (raison « version non
 * supportée »), jamais comptée comme erreur.
 */
export const RULES_SETS: RulesSet[] = [
  { min: '4.16.0', maxExclusive: null, files: [BASE_RULES_FILE] },
  {
    // Petit déjeuner refondu en 4.16.0 : profil agrégé avant, composants après.
    min: '4.10.1',
    maxExclusive: '4.16.0',
    files: [BASE_RULES_FILE, before416],
  },
  {
    // 4.10.0 : `consommation totale hors individuel` n'existe pas encore,
    // c'est `consommation totale collectif`.
    min: '4.10.0',
    maxExclusive: '4.10.1',
    files: [BASE_RULES_FILE, before416, before4101],
  },
  {
    // Avant 4.10.0 : ni `chauffage . mode` ni `. principal`, et la voiture
    // moyenne du modèle utilise le gabarit `berline` (et non `moyenne`).
    min: '4.9.1',
    maxExclusive: '4.10.0',
    files: [BASE_RULES_FILE, before416, before4101, before4100],
  },
  {
    // Avant 4.9.1 : `empreinte branche . <code> par hab . services publics`
    // n'existe pas, la ventilation NAF est impossible (feuilles à 0, agrégats
    // du modèle).
    min: '4.6.0',
    maxExclusive: '4.9.1',
    files: [BASE_RULES_FILE, before416, before4101, before4100, before491],
  },
]

/** Compare deux versions `X.Y.Z`. */
export const compareVersions = (a: string, b: string): number => {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x - y
  }
  return 0
}

const isVersionInRange = (version: string, set: RulesSet): boolean =>
  compareVersions(version, set.min) >= 0 &&
  (set.maxExclusive == null || compareVersions(version, set.maxExclusive) < 0)

/** Jeu de règles applicable à une version, ou `null` si non supportée. */
export const getRulesSet = (version: string): RulesSet | null =>
  RULES_SETS.find((set) => isVersionInRange(version, set)) ?? null

/**
 * Une version de modèle a la forme `X.Y.Z`, éventuellement suffixée d'une
 * pré-version (`4.13.0-rc.2`). Les pré-versions sont rattachées à leur version
 * de publication : `4.13.0-rc.2` → `4.13.0`.
 *
 * `pr-2824` (packages éphémères `pkg-pr-new`, hors registre npm) n'a pas de
 * version de publication et reste ignoré.
 */
const RELEASE_VERSION_RE = /^(\d+\.\d+\.\d+)(?:-\w[\w.]*)?$/

export const getReleaseVersion = (version: string): string | null => {
  const match = RELEASE_VERSION_RE.exec(String(version))
  return match ? match[1] : null
}

export const isPublishedVersion = (version: string): boolean =>
  getReleaseVersion(version) != null

/** Extrait la version du modèle depuis le champ `model` (ex. `FR-fr-4.17.0`). */
export const getVersionFromModel = (model: string): string =>
  model.split('-').slice(2).join('-')

/**
 * Expression SQL équivalente à `getReleaseVersion`, appliquée à `s.model` :
 * `FR-fr-4.13.0-rc.2` → `4.13.0`, `FR-fr-4.17.3` → `4.17.3`,
 * `FR-fr-pr-2808` → `pr-2808`.
 */
export const SQL_VERSION = `substring(s.model from '^[^-]+-[^-]+-(.*)$')`
export const SQL_RELEASE_VERSION = `regexp_replace(${SQL_VERSION}, '-[A-Za-z].*$', '')`

/** Charge et fusionne les fichiers d'un jeu de règles. */
const loadFiles = (files: string[]): Record<string, unknown> =>
  Object.assign(
    {},
    ...files.map((file) => getModelFromSource([rulesPath(file)]))
  ) as Record<string, unknown>

const rulesBySetCache = new Map<string, Record<string, unknown>>()

/** Règles de sous catégories d'une version, ou `null` si non supportée. */
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

/** Règles du fichier de base (définit les colonnes du CSV). */
export const getBaseRules = (): Record<string, unknown> =>
  loadFiles([BASE_RULES_FILE])

/**
 * Une règle est « vide » quand elle ne porte ni `formule` ni `valeur` : simple
 * nœud d'arborescence, exclu des colonnes du CSV.
 */
export const isEmptyRule = (rule: unknown): boolean => {
  if (rule == null || typeof rule !== 'object') return true
  const { formule, valeur } = rule as { formule?: unknown; valeur?: unknown }
  return formule === undefined && valeur === undefined
}

/**
 * Vérifie qu'aucune variante n'introduit de règle absente du fichier de base.
 *
 * Sans ce garde-fou, les colonnes du CSV varieraient d'une version à l'autre.
 * Renvoie la liste des fautes (vide si tout va bien).
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

/** Libellé lisible du jeu de règles appliqué à une version. */
export const rulesSetLabel = (version: string): string => {
  if (!isPublishedVersion(version)) return 'hors npm'
  const set = getRulesSet(version)
  if (!set) return 'NON SUPPORTÉE'
  if (set.files.length === 1) return 'base'
  return set.files
    .slice(1)
    .map((file) => file.replace(/^subcategories\./, '').replace(/\.ya?ml$/, ''))
    .join('+')
}
