#!/usr/bin/env node
/**
 * Exports the sub-categories of the simulations stored in the database, as CSV
 * to the Scaleway bucket.
 *
 * - the sub-category rules live in `./rules` and are the source of truth (the
 *   npm package `@incubateur-ademe/nosgestesclimat` does not publish them);
 * - the model rules of each version are downloaded from npm and cached in the
 *   bucket (see `lib/model-rules.ts`);
 * - the connection goes through `psql` with `SCALINGO_POSTGRESQL_URL` (the
 *   Prisma parameters of `DATABASE_URL` break libpq);
 * - the CSV and the checkpoint are uploaded regularly (the one-off container is
 *   ephemeral), which makes an interrupted run resumable;
 * - a heartbeat is printed every 5 minutes: Scalingo kills a one-off after 1
 *   hour **without stdout output**.
 *
 * Usage (from apps/server):
 *   npm run jobs:exportSubcategories -- --period 2026-01
 *   npm run jobs:exportSubcategories -- --period 2026-01 --sample-per-version 50
 *   npm run jobs:exportSubcategories -- --period 2026-01 --from 0 --no-upload
 */

import { mkdtempSync, rmSync } from 'node:fs'
import { appendFile, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Engine from 'publicodes'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { DELIMITER, csvEscape, formatNumber } from './lib/csv.ts'
import {
  ModelRulesNotFoundError,
  fetchModelRules,
  type ModelRules,
} from './lib/model-rules.ts'
import { resolvePeriod } from './lib/period.ts'
import {
  fetchSampledSimulations,
  fetchSimulationBatch,
  resolveDatabaseUrl,
  type Simulation,
} from './lib/postgres.ts'
import {
  RULES_SETS,
  SQL_VERSION,
  compareVersions,
  findExtraRules,
  findMissingRuleFiles,
  getBaseRules,
  getSubcategoryRules,
  getVersionFromModel,
  isEmptyRule,
  rulesSetLabel,
} from './lib/rules.ts'
import {
  buildKey,
  describeStorageError,
  downloadText,
  uploadText,
} from './lib/storage.ts'

const SUB_CATEGORIES_ROOT = 'bilan . sous catégories'

/// ---------------------- Arguments ----------------------

const argv = yargs(hideBin(process.argv))
  .version(false)
  .usage('Export sub-categories to the bucket\n\nUsage: $0 [options]')
  .option('period', {
    alias: 'p',
    type: 'string',
    description: 'Month to export (YYYY-MM). Sets --start-date and --end-date',
  })
  .option('start-date', {
    type: 'string',
    description: "Period start (included), 'YYYY-MM-DD'",
  })
  .option('end-date', {
    type: 'string',
    description: "Period end ('YYYY-MM-DD', included)",
  })
  .option('batch', {
    alias: 'b',
    type: 'number',
    default: 1000,
    description: 'Batch size (1000 ≈ 20 MB of situations, ~20 s per batch)',
  })
  .option('schema', {
    alias: 's',
    type: 'string',
    default: 'ngc',
    description: 'Postgres schema',
  })
  .option('from', {
    alias: 'f',
    type: 'string',
    default: 'auto',
    description:
      "Resume: 'auto' (checkpoint from the bucket) or '0' / 'all' (start over)",
  })
  .option('sample-per-version', {
    type: 'number',
    description:
      'Pre-flight: at most N simulations per version (non-exhaustive CSV)',
  })
  .option('sample-mode', {
    type: 'string',
    choices: ['first', 'spread', 'random'] as const,
    default: 'first',
    description: 'Pre-flight: first | spread | random',
  })
  .option('sample-seed', {
    type: 'string',
    default: '0',
    description: 'Pre-flight, random mode: draw seed',
  })
  .option('versions', {
    type: 'string',
    description: 'Pre-flight: versions to test, comma separated',
  })
  .option('upload', {
    type: 'boolean',
    default: true,
    description: 'Upload the CSV and the checkpoint to the bucket',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
  })
  .help('h')
  .alias('h', 'help')
  .parseSync()

const {
  period,
  batch,
  schema,
  upload,
  verbose,
  samplePerVersion: samplePerVersionArg,
  sampleMode: sampleModeArg,
  sampleSeed,
  versions: versionsArg,
  from: fromArg,
} = argv

/// ---------------------- Period ----------------------

const {
  period: periodLabel,
  startDate,
  endDate,
} = resolvePeriod({
  period,
  startDate: argv.startDate,
  endDate: argv.endDate,
})

/// ---------------------- Option validation ----------------------

if (
  samplePerVersionArg != null &&
  (!Number.isInteger(samplePerVersionArg) || samplePerVersionArg < 1)
) {
  throw new Error('--sample-per-version must be an integer >= 1.')
}

const samplePerVersion = samplePerVersionArg ?? null

const versionFilter = versionsArg
  ? String(versionsArg)
      .split(',')
      .map((version) => version.trim())
      .filter(Boolean)
  : null

if (versionFilter != null && samplePerVersion == null) {
  throw new Error(
    '--versions only makes sense with --sample-per-version (otherwise the whole period is exported).'
  )
}

type SampleMode = 'first' | 'spread' | 'random'
const sampleMode = (sampleModeArg ?? 'first') as SampleMode

const resume = String(fromArg).trim().toLowerCase() === 'auto'

/// ---------------------- Outputs ----------------------

const csvFilename = `sous-categories-${periodLabel}${
  samplePerVersion != null ? '-echantillon' : ''
}.csv`
const csvKey = buildKey(periodLabel, csvFilename)
const checkpointKey = `${csvKey}.checkpoint.json`

/**
 * Working directory of the run. `mkdtemp` creates a unique `0700` directory:
 * writing a predictable name in `os.tmpdir()` would expose the CSV
 * (simulation situations) to any other process of the machine
 * (`js/insecure-temporary-file`).
 */
const workDir = mkdtempSync(path.join(tmpdir(), 'ngc-subcategories-'))
const csvPath = path.join(workDir, csvFilename)
const checkpointPath = `${csvPath}.checkpoint.json`

type Incoherent = {
  id: string
  version: string
  total: number
  subcategoriesTotal: number
}
type Skipped = { id: string; model: string; reason: string }
type Failed = { id: string; model: string; message: string }

type Checkpoint = {
  lastCreatedAt: string | null
  lastId: string | null
  processed: number
  written: number
  startDate: string
  endDate: string
  rulesSetKey: string
  samplePerVersion: number | null
  sampleMode: string
  sampleSeed: string | null
  versionFilter: string[] | null
  incoherent: Incoherent[]
  errors: Failed[]
  skipped: Skipped[]
  updatedAt: string
}

const rulesSetKey = JSON.stringify(RULES_SETS)

/** Guard: never resume from a checkpoint produced with other options. */
const assertCheckpointCompatible = (checkpoint: Checkpoint): void => {
  const diffs: string[] = []
  if (checkpoint.startDate !== startDate) diffs.push('startDate')
  if (checkpoint.endDate !== endDate) diffs.push('endDate')
  if (checkpoint.rulesSetKey !== rulesSetKey) diffs.push('rulesSetKey')
  if ((checkpoint.samplePerVersion ?? null) !== samplePerVersion) {
    diffs.push('samplePerVersion')
  }
  if (
    JSON.stringify(checkpoint.versionFilter ?? null) !==
    JSON.stringify(versionFilter)
  ) {
    diffs.push('versionFilter')
  }

  if (diffs.length > 0) {
    throw new Error(
      `Checkpoint ${checkpointKey} was produced with different parameters (${diffs.join(', ')}). ` +
        `Use --from 0 to start over, or another period.`
    )
  }
}

/// ---------------------- Engines ----------------------

/**
 * Same options as the app: avoids cyclic reference warnings and partial
 * situation errors (a simulation situation is never complete).
 */
const engineOptions = {
  logger: { log: () => {}, warn: () => {}, error: () => {} },
  strict: {
    situation: false,
    noOrphanRule: false,
    checkPossibleValues: false,
    noCycleRuntime: false,
  },
  warn: { cyclicReferences: false, situationIssues: false },
}

const engineCache = new Map<string, Engine>()
const modelRulesCache = new Map<string, ModelRules>()

/** Instantiates (and caches) one engine per model version. */
const getEngine = async (
  version: string,
  subcategoryRules: Record<string, unknown>
): Promise<Engine> => {
  const cached = engineCache.get(version)
  if (cached) return cached

  let modelRules = modelRulesCache.get(version)
  if (!modelRules) {
    modelRules = await fetchModelRules(version, { upload })
    modelRulesCache.set(version, modelRules)
  }

  // `modelRules` comes from untyped JSON: Publicodes validates the structure in
  // its parser, the cast only satisfies TypeScript.
  const rules = { ...modelRules, ...subcategoryRules } as never
  const engine = new Engine(rules, engineOptions)
  engineCache.set(version, engine)
  return engine
}

/// ---------------------- Values ----------------------

/** An undefined evaluation is 0 (empty cells are not allowed in the CSV). */
const toNumber = (nodeValue: unknown): number =>
  typeof nodeValue === 'number' && Number.isFinite(nodeValue) ? nodeValue : 0

/** Rounds to the tenth and normalises `-0`. */
const roundToTenth = (value: number): number => {
  const rounded = Math.round(value * 10) / 10
  return rounded === 0 ? 0 : rounded
}

/// ---------------------- Columns ----------------------

const baseRules = getBaseRules()

// Guard: a missing or column-adding variant would silently change the output.
const missingRules = findMissingRuleFiles()
if (missingRules.length > 0) {
  throw new Error(
    `Rules files referenced by RULES_SETS are missing:\n${missingRules
      .map((file) => `   ${file}`)
      .join('\n')}`
  )
}
const extraRules = findExtraRules(baseRules)
if (extraRules.length > 0) {
  throw new Error(
    `Some variant files introduce rules absent from the base file:\n${extraRules
      .map(({ file, extra }) => `   ${file}: ${extra.join(', ')}`)
      .join('\n')}`
  )
}

const allSubcategories = Object.keys(baseRules)
const subcategories = allSubcategories.filter(
  (name) => !isEmptyRule(baseRules[name])
)

const header = [
  'simulationId',
  'date',
  'progression',
  'bilan',
  'bilanCoherent',
  ...subcategories.map(csvEscape),
]

/// ---------------------- Computing one simulation ----------------------

type Row = {
  line: string
  isCoherent: boolean
  total: number
  subcategoriesTotal: number
}

/**
 * Computes the CSV line of a simulation, or `null` if the version is
 * unsupported. The version is the one of the simulation's model, pre-release
 * included: it selects both the sub-category rules set and the npm model rules.
 *
 * The `date` column carries `createdAt` (the server insertion timestamp), not
 * `Simulation.date`: the latter is set by the browser without validation, so it
 * can be backdated by years or overflow to 2038. The column name is kept as-is
 * because downstream tools rely on it.
 */
const computeRow = async (
  simulation: Simulation,
  version: string
): Promise<Row | null> => {
  const rules = getSubcategoryRules(version)
  if (rules == null) return null

  const engine = await getEngine(version, rules)
  engine.setSituation(simulation.situation as never)

  const total = roundToTenth(toNumber(engine.evaluate('bilan').nodeValue))
  const subcategoriesTotal = roundToTenth(
    toNumber(engine.evaluate(SUB_CATEGORIES_ROOT).nodeValue)
  )

  const cells = subcategories.map((name) =>
    csvEscape(
      formatNumber(roundToTenth(toNumber(engine.evaluate(name).nodeValue)))
    )
  )

  return {
    line: [
      csvEscape(simulation.id),
      csvEscape(simulation.createdAt),
      csvEscape(simulation.progression),
      csvEscape(formatNumber(total)),
      String(subcategoriesTotal === total),
      ...cells,
    ].join(DELIMITER),
    isCoherent: subcategoriesTotal === total,
    total,
    subcategoriesTotal,
  }
}

/// ---------------------- Statistics ----------------------

type Stats = {
  sampled: number
  written: number
  incoherent: number
  errors: number
  skipped: number
  firstError: string | null
}

const statsByModel = new Map<string, Stats>()

const statsFor = (model: string): Stats => {
  let stats = statsByModel.get(model)
  if (!stats) {
    stats = {
      sampled: 0,
      written: 0,
      incoherent: 0,
      errors: 0,
      skipped: 0,
      firstError: null,
    }
    statsByModel.set(model, stats)
  }
  return stats
}

/// ---------------------- Processing a batch ----------------------

/**
 * Number of consecutive failures after which the run aborts. A systemic failure
 * (bucket policy, network, missing npm package) fails every simulation, and
 * without this guard the whole period would be burned in seconds with nothing
 * written.
 */
const MAX_CONSECUTIVE_ERRORS = 20

/**
 * Processes a batch and returns the CSV lines produced. Deliberately
 * sequential: each simulation reuses the Publicodes engine of its version, and
 * `setSituation` mutates it (no parallelisation without one engine per
 * simulation).
 *
 * The cursor only moves on success or deliberate skip: when the run aborts, the
 * checkpoint of the bucket is still the previous one, so the whole batch is
 * replayed instead of losing the failed simulations.
 */
const processBatch = async (
  simulations: Simulation[],
  state: Checkpoint
): Promise<string[]> => {
  const lines: string[] = []
  let consecutiveErrors = 0

  for (const simulation of simulations) {
    state.processed++

    const stats = statsFor(simulation.model)
    stats.sampled++

    const version = getVersionFromModel(simulation.model)

    try {
      const row = await computeRow(simulation, version)
      if (row == null) {
        stats.skipped++
        state.skipped.push({
          id: simulation.id,
          model: simulation.model,
          reason: `no sub-category rules for ${version}`,
        })
        state.lastCreatedAt = simulation.createdAt
        state.lastId = simulation.id
        continue
      }

      if (!row.isCoherent) {
        stats.incoherent++
        state.incoherent.push({
          id: simulation.id,
          version,
          total: row.total,
          subcategoriesTotal: row.subcategoriesTotal,
        })
      }

      lines.push(row.line)
      state.written++
      stats.written++
      state.lastCreatedAt = simulation.createdAt
      state.lastId = simulation.id
      consecutiveErrors = 0

      if (verbose) {
        console.log(
          `${row.isCoherent ? '✔' : '✘'} ${simulation.id} (${simulation.model}) ` +
            `bilan=${row.total} subcategories=${row.subcategoriesTotal}`
        )
      }
    } catch (error) {
      if (error instanceof ModelRulesNotFoundError) {
        stats.skipped++
        state.skipped.push({
          id: simulation.id,
          model: simulation.model,
          reason: error.message,
        })
        state.lastCreatedAt = simulation.createdAt
        state.lastId = simulation.id
        continue
      }

      stats.errors++
      const message = error instanceof Error ? error.message : String(error)
      stats.firstError ??= message
      state.errors.push({ id: simulation.id, model: simulation.model, message })
      console.error(`\n✘ ${simulation.id} (${simulation.model}): ${message}`)
      consecutiveErrors++

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new Error(
          `Aborting: ${consecutiveErrors} consecutive failures (last one on ${version}: ${message}).\n` +
            `Nothing is lost: the checkpoint still points to the last successful batch.\n` +
            `Fix the cause, then rerun the same command (resumes automatically).`
        )
      }
    }
  }

  return lines
}

/// ---------------------- Report ----------------------

const printTable = (
  rows: Record<string, string | number>[],
  columns: [string, string][]
): void => {
  const widths = columns.map(([key, label]) =>
    Math.max(label.length, ...rows.map((row) => String(row[key]).length))
  )
  const format = (values: (string | number)[]) =>
    values.map((value, i) => String(value).padEnd(widths[i])).join('  ')
  console.log(format(columns.map(([, label]) => label)))
  for (const row of rows) console.log(format(columns.map(([key]) => row[key])))
}

const printVersionReport = (): void => {
  const groups = new Map<string, Record<string, number>>()
  for (const [model, stats] of statsByModel) {
    const version = getVersionFromModel(model)
    const group = groups.get(version) ?? {
      models: 0,
      sampled: 0,
      written: 0,
      incoherent: 0,
      errors: 0,
      skipped: 0,
    }
    group.models++
    for (const key of [
      'sampled',
      'written',
      'incoherent',
      'errors',
      'skipped',
    ] as const) {
      group[key] += stats[key]
    }
    groups.set(version, group)
  }

  // Versions listed but with no simulation at all over the period.
  for (const version of versionFilter ?? []) {
    if (!groups.has(version)) {
      groups.set(version, {
        models: 0,
        sampled: 0,
        written: 0,
        incoherent: 0,
        errors: 0,
        skipped: 0,
      })
    }
  }

  const rows = [...groups.entries()]
    .sort(([a], [b]) => compareVersions(b, a))
    .map(([version, group]) => ({
      version,
      ...group,
      rules: rulesSetLabel(version),
    }))

  console.log('\n📊 Compatibility per version:')
  printTable(rows, [
    ['version', 'version'],
    ['models', 'models'],
    ['sampled', 'sampled'],
    ['written', 'written'],
    ['incoherent', 'incoherent'],
    ['errors', 'errors'],
    ['skipped', 'skipped'],
    ['rules', 'rules'],
  ])
}

const report = (state: Checkpoint, resumed: boolean): void => {
  console.log('\n')
  console.log(`✅ ${state.written} simulations written`)
  console.log(`   period: ${state.startDate} → ${state.endDate}`)
  console.log(`   ${subcategories.length} sub-category columns`)

  if (samplePerVersion != null) printVersionReport()

  const cumulative = resumed ? ' (cumulative since the last --from 0)' : ''

  if (state.skipped.length > 0) {
    const byReason = new Map<string, number>()
    for (const { reason } of state.skipped) {
      byReason.set(reason, (byReason.get(reason) ?? 0) + 1)
    }
    console.log(
      `\n⏭  ${state.skipped.length} simulations skipped${cumulative}:`
    )
    for (const [reason, count] of byReason) {
      console.log(`   ${reason}: ${count}`)
    }
  }

  if (state.errors.length > 0) {
    console.log(`\n✘ ${state.errors.length} simulations failed${cumulative}:`)
    for (const { id, model, message } of state.errors.slice(0, 20)) {
      console.log(`   ${id} (${model}): ${message}`)
    }
    if (state.errors.length > 20) {
      console.log(`   … and ${state.errors.length - 20} more`)
    }
  }

  if (state.incoherent.length === 0) {
    console.log(
      '\n✔ "bilan . sous catégories" equals "bilan" (to the tenth) for every simulation'
    )
  } else {
    console.log(
      `\n⚠️  ${state.incoherent.length} simulations flagged (bilan ≠ sub-categories):`
    )
    for (const {
      id,
      version,
      total,
      subcategoriesTotal,
    } of state.incoherent.slice(0, 20)) {
      console.log(
        `   ${id} (${version}): bilan=${total} subcategories=${subcategoriesTotal}`
      )
    }
    if (state.incoherent.length > 20) {
      console.log(`   … and ${state.incoherent.length - 20} more`)
    }
  }
}

/// ---------------------- Main ----------------------

const main = async (): Promise<void> => {
  const url = resolveDatabaseUrl()

  console.log(`➡️  Exporting sub-categories ${periodLabel}`)
  console.log(`➡️  Period: ${startDate} → ${endDate} (upper bound excluded)`)
  console.log(`➡️  ${subcategories.length} sub-category rules`)
  console.log(`➡️  Output: ${csvKey}`)
  console.log(`➡️  Local file: ${csvPath}`)
  if (samplePerVersion != null) {
    console.log(
      `➡️  Pre-flight: at most ${samplePerVersion} simulation(s) per version (${sampleMode})`
    )
  }

  // Resume: the checkpoint and the CSV live in the bucket. Disabled in
  // pre-flight mode: the sample is computed in a single query, so "resuming"
  // would replay the whole draw and duplicate lines.
  let checkpoint: Checkpoint | null = null
  if (resume && upload && samplePerVersion == null) {
    const raw = await downloadText(checkpointKey)
    if (raw) {
      checkpoint = JSON.parse(raw) as Checkpoint
      assertCheckpointCompatible(checkpoint)
      const existingCsv = await downloadText(csvKey)
      if (existingCsv != null) await writeFile(csvPath, existingCsv)
      console.log(
        `♻️  Resuming: ${checkpoint.written} simulations already written${
          checkpoint.lastCreatedAt
            ? `, last createdAt ${checkpoint.lastCreatedAt}`
            : ''
        }`
      )
    }
  }

  const state: Checkpoint = checkpoint ?? {
    lastCreatedAt: null,
    lastId: null,
    processed: 0,
    written: 0,
    startDate,
    endDate,
    rulesSetKey,
    samplePerVersion,
    sampleMode,
    sampleSeed: sampleMode === 'random' ? sampleSeed : null,
    versionFilter,
    incoherent: [],
    errors: [],
    skipped: [],
    updatedAt: new Date().toISOString(),
  }

  if (!checkpoint) {
    await writeFile(csvPath, `${header.join(DELIMITER)}\n`)
    console.log('➡️  Starting from the beginning')
  }

  // Heartbeat: Scalingo kills a one-off after 1 hour without stdout output.
  const heartbeat = setInterval(
    () => {
      console.log(
        `⏳ ${state.written} simulations written (${state.processed} processed)`
      )
    },
    5 * 60 * 1000
  )

  /**
   * Uploads the CSV and the checkpoint to the bucket. Unlike the rules cache, a
   * failure here is **fatal**: without the upload the work is lost with the
   * one-off container.
   */
  const flush = async (): Promise<void> => {
    if (!upload) return
    try {
      await uploadText(csvKey, await readFile(csvPath, 'utf8'))
      await uploadText(
        checkpointKey,
        JSON.stringify(state, null, 2),
        'application/json'
      )
    } catch (error) {
      throw new Error(describeStorageError('write', csvKey, error))
    }
  }

  const UPLOAD_EVERY = 25

  try {
    if (samplePerVersion != null) {
      // Pre-flight: a single batch, the sample per version.
      const simulations = fetchSampledSimulations({
        url,
        schema,
        startDate,
        endDate,
        perVersion: samplePerVersion,
        sampleMode,
        sampleSeed,
        versionExpression: SQL_VERSION,
        versionFilter,
      })
      const lines = await processBatch(simulations, state)
      if (lines.length > 0) await appendFile(csvPath, `${lines.join('\n')}\n`)
      state.updatedAt = new Date().toISOString()
      await flush()
    } else {
      let batchesSinceUpload = 0
      for (;;) {
        const simulations = fetchSimulationBatch({
          url,
          schema,
          lastCreatedAt: state.lastCreatedAt,
          lastId: state.lastId,
          startDate,
          endDate,
          limit: batch,
        })
        if (simulations.length === 0) break

        const lines = await processBatch(simulations, state)

        // The CSV of the batch is written first, then the checkpoint: on a
        // crash between the two, we can at worst reprocess one batch.
        if (lines.length > 0) await appendFile(csvPath, `${lines.join('\n')}\n`)
        state.updatedAt = new Date().toISOString()
        await writeFile(checkpointPath, JSON.stringify(state, null, 2))
        process.stdout.write(`\r   ${state.written} simulations written`)

        if (++batchesSinceUpload >= UPLOAD_EVERY) {
          await flush()
          batchesSinceUpload = 0
        }
      }
      await flush()
    }
  } finally {
    clearInterval(heartbeat)
  }

  state.updatedAt = new Date().toISOString()
  await writeFile(checkpointPath, JSON.stringify(state, null, 2))
  if (upload) await flush()

  report(state, checkpoint != null)

  // The CSV is in the bucket: the working directory is no longer needed. With
  // `--no-upload` it is kept (it is the run output) and its path is printed.
  if (upload) {
    await rm(workDir, { recursive: true, force: true })
  } else {
    console.log(`\nFile kept: ${csvPath}`)
  }

  if (state.errors.length > 0) process.exitCode = 1
}

main().catch((error) => {
  // An interrupted run leaves a private directory behind: remove it so the CSVs
  // (simulation situations) do not pile up on disk. Synchronous on purpose:
  // `process.exit()` would outrun an async `rm`.
  rmSync(workDir, { recursive: true, force: true })
  console.error(error)
  process.exit(1)
})
