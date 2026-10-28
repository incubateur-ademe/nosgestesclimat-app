/**
 * Model rules for a published version, fetched from npm.
 *
 * The published `@incubateur-ademe/nosgestesclimat` package ships
 * `nosgestesclimat.model.json`, i.e. the compiled model rules. It is the only
 * reliable way to replay a 2026 simulation with the rules of *its* time: the
 * installed package only holds the current version.
 *
 * The tarball is decompressed in memory (`zlib`) and read with `tar`, which the
 * Scalingo image provides. The rules are cached in the bucket so a resumed run
 * does not download them again.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import {
  buildKey,
  describeStorageError,
  downloadText,
  uploadText,
} from './storage.ts'

const REGISTRY_URL =
  'https://registry.npmjs.org/@incubateur-ademe/nosgestesclimat/-/nosgestesclimat'

const MODEL_FILE = 'nosgestesclimat.model.json'

export type ModelRules = Record<string, unknown>

const memoryCache = new Map<string, ModelRules>()

/** Versions npm answered 404 for: definitive, and not retried per simulation. */
const notOnNpm = new Set<string>()

export class ModelRulesNotFoundError extends Error {
  constructor(version: string) {
    super(`model rules for ${version} are not published on npm`)
    this.name = 'ModelRulesNotFoundError'
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** S3 key of the rules cache of a version, shared across periods. */
const cacheKey = (version: string) =>
  buildKey('_model-cache', `${version}.json`)

/**
 * Downloads the npm tarball of a version and extracts `MODEL_FILE`.
 *
 * `tar -xO` writes to stdout, so nothing is left on disk. 404s (unpublished
 * version) are final and not retried.
 */
const downloadFromNpm = async (version: string): Promise<ModelRules> => {
  const url = `${REGISTRY_URL}-${version}.tgz`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Cannot download the npm tarball from ${url}: ${response.status}`
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
      `Cannot read ${MODEL_FILE} from tarball ${version}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Model rules of a published version, with a memory cache, a bucket cache and 4
 * attempts (an isolated `ECONNRESET` must not lose a simulation).
 */
export const fetchModelRules = async (
  version: string,
  { upload = true }: { upload?: boolean } = {}
): Promise<ModelRules> => {
  const cached = memoryCache.get(version)
  if (cached) return cached
  if (notOnNpm.has(version)) {
    throw new ModelRulesNotFoundError(version)
  }

  // Bucket cache: needed to resume (the container is ephemeral). Disabled with
  // `--no-upload`: locally we want to reach neither S3 nor the full config.
  const key = cacheKey(version)
  if (upload) {
    try {
      const fromBucket = await downloadText(key)
      if (fromBucket != null) {
        const rules = JSON.parse(fromBucket) as ModelRules
        memoryCache.set(version, rules)
        return rules
      }
    } catch (error) {
      console.warn(
        `⚠️  ${describeStorageError('read', key, error)} — falling back to npm.`
      )
    }
  }

  let lastError: unknown
  const attempts = 4
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const rules = await downloadFromNpm(version)
      memoryCache.set(version, rules)

      if (upload) {
        try {
          await uploadText(key, JSON.stringify(rules), 'application/json')
        } catch (error) {
          // The run can go on: only the cache is missing, so a resumed run will
          // download this version from npm again.
          console.warn(`⚠️  ${describeStorageError('write', key, error)}`)
        }
      }
      return rules
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (/: 404$/.test(message)) {
        notOnNpm.add(version)
        break
      }
      if (attempt === attempts) break
      const delay = 500 * 2 ** (attempt - 1)
      console.warn(
        `⚠️  npm ${version}: ${message} — retrying in ${delay} ms (${attempt}/${attempts})`
      )
      await sleep(delay)
    }
  }

  if (notOnNpm.has(version)) throw new ModelRulesNotFoundError(version)
  throw lastError
}
