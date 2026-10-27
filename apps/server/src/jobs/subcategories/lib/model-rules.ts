/**
 * Règles du modèle pour une version publiée, récupérées depuis npm.
 *
 * Le paquet `@incubateur-ademe/nosgestesclimat` publié sur npm contient
 * `nosgestesclimat.model.json` : les règles du modèle compilé, version par
 * version. C'est la seule source fiable pour recalculer une simulation de 2026
 * avec les règles de *son* époque (le paquet installé ne contient que la
 * version courante).
 *
 * Le tarball est décompressé en mémoire (`zlib`) puis lu avec `tar`, présent
 * dans l'image Scalingo. Les règles obtenues sont mises en cache dans le
 * bucket : un run repris après interruption ne retélécharge pas les versions
 * déjà récupérées.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import { downloadText, uploadText } from './storage.ts'

const REGISTRY_URL =
  'https://registry.npmjs.org/@incubateur-ademe/nosgestesclimat/-/nosgestesclimat'

const MODEL_FILE = 'nosgestesclimat.model.json'

export type ModelRules = Record<string, unknown>

const memoryCache = new Map<string, ModelRules>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Clé S3 du cache des règles d'une version. */
const cacheKey = (version: string) =>
  `export-subcategories/_model-cache/${version}.json`

/**
 * Télécharge le tarball npm d'une version et en extrait `MODEL_FILE`.
 *
 * `tar -xO` écrit le fichier sur stdout : pas besoin de le déposer sur disque.
 * Les 404 (version non publiée) sont définitifs et ne sont pas réessayés.
 */
const downloadFromNpm = async (version: string): Promise<ModelRules> => {
  const url = `${REGISTRY_URL}-${version}.tgz`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Impossible de télécharger le tarball npm depuis ${url}: ${response.status}`
    )
  }

  const tar = gunzipSync(Buffer.from(await response.arrayBuffer()))
  const dir = mkdtempSync(path.join(tmpdir(), 'ngc-model-'))
  const tarPath = path.join(dir, `${version}.tar`)

  try {
    writeFileSync(tarPath, tar)
    const stdout = execFileSync(
      'tar',
      ['-xOf', tarPath, `package/${MODEL_FILE}`],
      {
        maxBuffer: 1024 * 1024 * 200,
        encoding: 'utf8',
      }
    )
    return JSON.parse(stdout) as ModelRules
  } catch (error) {
    throw new Error(
      `Lecture de ${MODEL_FILE} impossible dans le tarball ${version}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Règles du modèle d'une version publiée, avec cache mémoire, cache bucket et
 * 4 tentatives (un `ECONNRESET` isolé ne doit pas faire perdre de simulation).
 */
export const fetchModelRules = async (
  version: string,
  { upload = true }: { upload?: boolean } = {}
): Promise<ModelRules> => {
  const cached = memoryCache.get(version)
  if (cached) return cached

  // Cache bucket : indispensable en cas de reprise (le conteneur est éphémère).
  // Désactivé avec `--no-upload` : en local, on ne veut joindre ni S3 ni la
  // configuration complète du serveur.
  const key = cacheKey(version)
  if (upload) {
    const fromBucket = await downloadText(key)
    if (fromBucket != null) {
      const rules = JSON.parse(fromBucket) as ModelRules
      memoryCache.set(version, rules)
      return rules
    }
  }

  let lastError: unknown
  const attempts = 4
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const rules = await downloadFromNpm(version)
      memoryCache.set(version, rules)

      if (upload) {
        await uploadText(key, JSON.stringify(rules), 'application/json')
      }
      return rules
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      const definitive = /: 404$/.test(message)
      if (definitive || attempt === attempts) break
      const delay = 500 * 2 ** (attempt - 1)
      console.warn(
        `⚠️  npm ${version} : ${message} — nouvelle tentative dans ${delay} ms (${attempt}/${attempts})`
      )
      await sleep(delay)
    }
  }

  throw lastError
}
