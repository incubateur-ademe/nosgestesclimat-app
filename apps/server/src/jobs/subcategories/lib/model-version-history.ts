/**
 * Resolves the model package version that was declared by the application on
 * a given date.
 *
 * Some old simulations contain `0.0.0` as their model version. The model
 * package dependency in `package.json` is versioned in git, so its history is
 * the only reliable source for those rows.
 */

const MODEL_PACKAGE = '@incubateur-ademe/nosgestesclimat'
// A literal NUL cannot be passed as part of an execFile argument.
const COMMIT_MARKER = '@@MODEL_PACKAGE_COMMIT@@'
const VERSION_RE = /\d+\.\d+\.\d+(?:-[\w.]+)?/

export type PackageVersionHistoryEntry = {
  /** Commit date, in ISO format. */
  date: string
  version: string
}

/**
 * Snapshot generated from the git history of the model dependency.
 *
 * One-off containers do not contain `.git`, so the job cannot inspect the
 * repository at runtime. Keep this table in sync when the model dependency
 * is upgraded. The dates are the first day on which the version was declared
 * by the application.
 */
export const PACKAGE_VERSION_HISTORY: PackageVersionHistoryEntry[] = [
  { date: '2026-01-08', version: '4.7.0' },
  { date: '2026-01-20', version: '4.8.1' },
  { date: '2026-02-12', version: '4.9.0' },
  { date: '2026-02-19', version: '4.9.1' },
  { date: '2026-03-18', version: '4.10.0' },
  { date: '2026-03-31', version: '4.10.1' },
  { date: '2026-04-01', version: '4.10.2' },
  { date: '2026-04-14', version: '4.10.3' },
  { date: '2026-04-21', version: '4.10.5' },
  { date: '2026-05-22', version: '4.12.2' },
  { date: '2026-05-27', version: '4.12.4' },
  { date: '2026-06-04', version: '4.13.0-rc.2' },
  { date: '2026-06-29', version: '4.13.1' },
  { date: '2026-07-09', version: '4.14.0' },
  { date: '2026-08-03', version: '4.14.1' },
  { date: '2026-08-04', version: '4.14.2' },
  { date: '2026-08-20', version: '4.14.5' },
  { date: '2026-08-25', version: '4.15.0' },
  { date: '2026-08-27', version: '4.15.1' },
  { date: '2026-09-02', version: '4.16.1' },
  { date: '2026-09-22', version: '4.17.0' },
  { date: '2026-09-28', version: '4.17.1' },
  { date: '2026-10-07', version: '4.17.2' },
  { date: '2026-10-15', version: '4.17.3' },
]

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

/** Resolves a version using the cached package.json history snapshot. */
export const resolvePackageVersion = (simulationDate: string): string => {
  packageVersionHistory ??= PACKAGE_VERSION_HISTORY
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
