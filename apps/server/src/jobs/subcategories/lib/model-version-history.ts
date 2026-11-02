/**
 * Resolves the model package version that was declared by the application on
 * a given date.
 *
 * Some old simulations contain `0.0.0` as their model version. The model
 * package dependency in `package.json` is versioned in git, so its history is
 * the only reliable source for those rows.
 */

import { execFileSync } from 'node:child_process'

const MODEL_PACKAGE = '@incubateur-ademe/nosgestesclimat'
const PACKAGE_FILES = [
  'package.json',
  'apps/site/package.json',
  'apps/server/package.json',
  'packages/core/package.json',
]
// A literal NUL cannot be passed as part of an execFile argument.
const COMMIT_MARKER = '@@MODEL_PACKAGE_COMMIT@@'
const VERSION_RE = /\d+\.\d+\.\d+(?:-[\w.]+)?/

export type PackageVersionHistoryEntry = {
  /** Commit date, in ISO format. */
  date: string
  version: string
}

/**
 * Extracts the model version from an added dependency line in a git patch.
 *
 * Ranges such as `^4.6.0` are reduced to their declared lower bound. The
 * versions used during the affected February/March period are exact versions.
 */
export const parseModelPackageVersion = (line: string): string | null => {
  const match = new RegExp(
    `^\\+\\s*"${MODEL_PACKAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*"([^"]+)"`
  ).exec(line)
  return match?.[1].match(VERSION_RE)?.[0] ?? null
}

/** Parses the relevant entries from `git log -p` output. */
export const parsePackageVersionHistory = (
  log: string
): PackageVersionHistoryEntry[] => {
  const entries: PackageVersionHistoryEntry[] = []

  for (const block of log.split(COMMIT_MARKER).slice(1)) {
    const [header, ...lines] = block.split('\n')
    const [, date] = header.split('\t')
    if (!date) continue

    for (const line of lines) {
      const version = parseModelPackageVersion(line)
      if (version) entries.push({ date, version })
    }
  }

  return entries
}

const gitRoot = (): string => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Cannot resolve a 0.0.0 model version: git repository is unavailable (${message}).`
    )
  }
}

/**
 * Reads the model dependency changes in the package.json history.
 *
 * The history is loaded once because a month can contain many `0.0.0`
 * simulations.
 */
export const loadPackageVersionHistory = (): PackageVersionHistoryEntry[] => {
  const root = gitRoot()
  try {
    const log = execFileSync(
      'git',
      [
        'log',
        '--reverse',
        '--date=iso-strict',
        `--format=${COMMIT_MARKER}%H%x09%cI`,
        '-p',
        `-G"${MODEL_PACKAGE}"`,
        '--',
        ...PACKAGE_FILES,
      ],
      { cwd: root, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 }
    )
    const history = parsePackageVersionHistory(log)
    if (history.length === 0) {
      throw new Error(
        `no "${MODEL_PACKAGE}" dependency change was found in package.json history`
      )
    }
    return history.sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Cannot read package.json git history: ${message}`)
  }
}

const dateOnly = (value: string): string => value.slice(0, 10)

/**
 * Returns the last declared package version on or before `simulationDate`.
 * History entries must be ordered from oldest to newest.
 */
export const resolvePackageVersionAtDate = (
  simulationDate: string,
  history: PackageVersionHistoryEntry[]
): string | null => {
  const date = dateOnly(simulationDate)
  let version: string | null = null

  for (const entry of history) {
    if (dateOnly(entry.date) > date) break
    version = entry.version
  }

  return version
}

let packageVersionHistory: PackageVersionHistoryEntry[] | null = null

/** Resolves a version using the cached package.json git history. */
export const resolvePackageVersion = (simulationDate: string): string => {
  packageVersionHistory ??= loadPackageVersionHistory()
  const version = resolvePackageVersionAtDate(
    simulationDate,
    packageVersionHistory
  )
  if (!version) {
    throw new Error(
      `No model package version found in package.json history before ${dateOnly(simulationDate)}.`
    )
  }
  return version
}
