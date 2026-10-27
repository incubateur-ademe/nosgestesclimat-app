#!/usr/bin/env node
/**
 * Export des sous catégories pour les simulations stockées en base, en CSV vers
 * le bucket Scaleway.
 *
 *   - les règles de sous catégories vivent dans `./rules` et font foi (le paquet
 *     npm `@incubateur-ademe/nosgestesclimat` ne les publie pas) ;
 *   - les règles du modèle de chaque version sont téléchargées depuis npm, avec
 *     un cache dans le bucket (voir `lib/model-rules.ts`) ;
 *   - la connexion passe par `psql` avec `SCALINGO_POSTGRESQL_URL` (les
 *     paramètres Prisma de `DATABASE_URL` cassent libpq) ;
 *   - le CSV et le checkpoint sont envoyés dans le bucket régulièrement
 *     (conteneur one-off éphémère), ce qui permet de reprendre un run ;
 *   - un heartbeat est écrit sur stdout toutes les 5 min : Scalingo tue un
 *     one-off après 1 h **sans écriture** sur stdout.
 *
 * Pour chaque simulation :
 *   1. on résout les règles de sous catégories de sa version (`RULES_SETS`) ;
 *   2. on instancie un moteur Publicodes (mis en cache par version) ;
 *   3. on applique la situation et on évalue chaque règle de sous catégories ;
 *   4. on vérifie que `bilan . sous catégories` égale `bilan` au dixième.
 *
 * Usage (depuis apps/server) :
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
import { fetchModelRules, type ModelRules } from './lib/model-rules.ts'
import { resolvePeriod } from './lib/period.ts'
import {
  fetchSampledSimulations,
  fetchSimulationBatch,
  resolveDatabaseUrl,
  type Simulation,
} from './lib/postgres.ts'
import {
  RULES_SETS,
  SQL_RELEASE_VERSION,
  compareVersions,
  findExtraRules,
  getBaseRules,
  getReleaseVersion,
  getSubcategoryRules,
  getVersionFromModel,
  isEmptyRule,
  isPublishedVersion,
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
  .usage('Export des sous catégories vers le bucket\n\nUsage: $0 [options]')
  .option('period', {
    alias: 'p',
    type: 'string',
    description:
      'Mois à exporter (YYYY-MM). Définit --start-date et --end-date',
  })
  .option('start-date', {
    type: 'string',
    description: "Début de la période (inclus), 'YYYY-MM-DD'",
  })
  .option('end-date', {
    type: 'string',
    description: "Fin de la période ('YYYY-MM-DD' incluse)",
  })
  .option('batch', {
    alias: 'b',
    type: 'number',
    default: 1000,
    description: 'Taille des lots (1000 ≈ 20 Mo de situations, ~20 s par lot)',
  })
  .option('schema', {
    alias: 's',
    type: 'string',
    default: 'ngc',
    description: 'Schéma Postgres',
  })
  .option('from', {
    alias: 'f',
    type: 'string',
    default: 'auto',
    description:
      "Reprise : 'auto' (checkpoint du bucket) ou '0' / 'all' (repart de zéro)",
  })
  .option('sample-per-version', {
    type: 'number',
    description:
      'Pré-vol : au plus N simulations par version (CSV non exhaustif)',
  })
  .option('sample-mode', {
    type: 'string',
    choices: ['first', 'spread', 'random'] as const,
    default: 'first',
    description: 'Pré-vol : first | spread | random',
  })
  .option('sample-seed', {
    type: 'string',
    default: '0',
    description: 'Pré-vol, mode random : graine du tirage',
  })
  .option('versions', {
    type: 'string',
    description: 'Pré-vol : versions à tester, séparées par des virgules',
  })
  .option('upload', {
    type: 'boolean',
    default: true,
    description: 'Envoyer le CSV et le checkpoint dans le bucket',
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

/// ---------------------- Période ----------------------

const {
  period: periodLabel,
  startDate,
  endDate,
} = resolvePeriod({
  period,
  startDate: argv.startDate,
  endDate: argv.endDate,
})

/// ---------------------- Validation des options ----------------------

if (
  samplePerVersionArg != null &&
  (!Number.isInteger(samplePerVersionArg) || samplePerVersionArg < 1)
) {
  throw new Error('--sample-per-version doit être un entier >= 1.')
}

const samplePerVersion = samplePerVersionArg ?? null

const versionFilter = versionsArg
  ? String(versionsArg)
      .split(',')
      .map((version) => version.trim())
      .filter(Boolean)
      .map((version) => {
        const release = getReleaseVersion(version)
        if (release == null) {
          throw new Error(`Version invalide dans --versions : "${version}".`)
        }
        return release
      })
  : null

if (versionFilter != null && samplePerVersion == null) {
  throw new Error(
    "--versions n'a de sens qu'avec --sample-per-version (sinon toute la période est exportée)."
  )
}

type SampleMode = 'first' | 'spread' | 'random'
const sampleMode = (sampleModeArg ?? 'first') as SampleMode

const resume = String(fromArg).trim().toLowerCase() === 'auto'

/// ---------------------- Sorties ----------------------

const csvFilename = `sous-categories-${periodLabel}${
  samplePerVersion != null ? '-echantillon' : ''
}.csv`
const csvKey = buildKey(periodLabel, csvFilename)
const checkpointKey = `${csvKey}.checkpoint.json`

/**
 * Répertoire de travail du run.
 *
 * `mkdtemp` crée un dossier **unique** avec les permissions `0700` : écrire
 * directement dans `os.tmpdir()` avec un nom prévisible exposerait le CSV (qui
 * contient des situations de simulations) à tout autre processus de la machine
 * (`js/insecure-temporary-file`).
 */
const workDir = mkdtempSync(path.join(tmpdir(), 'ngc-subcategories-'))
const csvPath = path.join(workDir, csvFilename)
const checkpointPath = `${csvPath}.checkpoint.json`

type Incoherent = {
  id: string
  version: string
  bilan: number
  bilanSubcategories: number
}
type Skipped = { id: string; model: string; reason: string }
type Failed = { id: string; model: string; message: string }

type Checkpoint = {
  lastDate: string | null
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

/** Garde-fou : ne jamais reprendre un checkpoint produit avec d'autres options. */
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
      `Le checkpoint ${checkpointKey} a été produit avec d'autres paramètres (${diffs.join(', ')}). ` +
        `Utiliser --from 0 pour repartir de zéro, ou une autre période.`
    )
  }
}

/// ---------------------- Moteurs ----------------------

/**
 * Options identiques à celles de l'app : évite les avertissements liés aux
 * références circulaires et aux situations partielles (une situation de
 * simulation n'est jamais complète).
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

/** Instancie (et met en cache) un moteur par version de modèle. */
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

  // `modelRules` vient d'un JSON non typé : Publicodes valide la structure dans
  // son parseur, le cast ne fait que satisfaire TypeScript.
  const rules = { ...modelRules, ...subcategoryRules } as never
  const engine = new Engine(rules, engineOptions)
  engineCache.set(version, engine)
  return engine
}

/// ---------------------- Valeurs ----------------------

/** Une évaluation indéfinie vaut 0 (cellule vide interdite dans le CSV). */
const toNumber = (nodeValue: unknown): number =>
  typeof nodeValue === 'number' && Number.isFinite(nodeValue) ? nodeValue : 0

/** Arrondit au dixième et normalise `-0`. */
const roundToTenth = (value: number): number => {
  const rounded = Math.round(value * 10) / 10
  return rounded === 0 ? 0 : rounded
}

/// ---------------------- Colonnes ----------------------

const baseRules = getBaseRules()

// Garde-fou : une variante qui ajoute une règle ferait varier les colonnes.
const extraRules = findExtraRules(baseRules)
if (extraRules.length > 0) {
  throw new Error(
    `Des fichiers de variante introduisent des règles absentes du fichier de base :\n${extraRules
      .map(({ file, extra }) => `   ${file} : ${extra.join(', ')}`)
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

/// ---------------------- Calcul d'une simulation ----------------------

type Row = {
  line: string
  isCoherent: boolean
  bilanRounded: number
  bilanSubcategoriesRounded: number
}

/** Calcule la ligne CSV d'une simulation, ou `null` si version non supportée. */
const computeRow = async (
  simulation: Simulation,
  version: string
): Promise<Row | null> => {
  const rules = getSubcategoryRules(version)
  if (rules == null) return null

  const engine = await getEngine(version, rules)
  engine.setSituation(simulation.situation as never)

  const bilan = toNumber(engine.evaluate('bilan').nodeValue)
  const bilanSubcategories = toNumber(
    engine.evaluate(SUB_CATEGORIES_ROOT).nodeValue
  )
  const bilanRounded = roundToTenth(bilan)
  const bilanSubcategoriesRounded = roundToTenth(bilanSubcategories)

  const cells = subcategories.map((name) =>
    csvEscape(
      formatNumber(roundToTenth(toNumber(engine.evaluate(name).nodeValue)))
    )
  )

  return {
    line: [
      csvEscape(simulation.id),
      csvEscape(simulation.date),
      csvEscape(simulation.progression),
      csvEscape(formatNumber(bilanRounded)),
      String(bilanSubcategoriesRounded === bilanRounded),
      ...cells,
    ].join(DELIMITER),
    isCoherent: bilanSubcategoriesRounded === bilanRounded,
    bilanRounded,
    bilanSubcategoriesRounded,
  }
}

/// ---------------------- Statistiques ----------------------

type Stats = {
  sampled: number
  written: number
  incoherent: number
  errors: number
  skipped: number
  firstError: string | null
  rulesVersion: string | null
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
      rulesVersion: null,
    }
    statsByModel.set(model, stats)
  }
  return stats
}

/// ---------------------- Traitement d'un lot ----------------------

/**
 * Traite un lot et renvoie les lignes CSV produites.
 *
 * Séquentiel volontairement : chaque simulation réutilise le moteur Publicodes
 * de sa version, et `setSituation` mute ce moteur (pas de parallélisation
 * possible sans un moteur par simulation).
 */
const processBatch = async (
  simulations: Simulation[],
  state: Checkpoint
): Promise<string[]> => {
  const lines: string[] = []

  for (const simulation of simulations) {
    state.lastDate = simulation.date
    state.lastId = simulation.id
    state.processed++

    const stats = statsFor(simulation.model)
    stats.sampled++

    const rawVersion = getVersionFromModel(simulation.model)
    if (!isPublishedVersion(rawVersion)) {
      stats.skipped++
      state.skipped.push({
        id: simulation.id,
        model: simulation.model,
        reason: 'version non publiée (npm)',
      })
      continue
    }

    const version = getReleaseVersion(rawVersion) as string
    stats.rulesVersion = version

    try {
      const row = await computeRow(simulation, version)
      if (row == null) {
        stats.skipped++
        state.skipped.push({
          id: simulation.id,
          model: simulation.model,
          reason: 'version non supportée',
        })
        continue
      }

      if (!row.isCoherent) {
        stats.incoherent++
        state.incoherent.push({
          id: simulation.id,
          version: rawVersion,
          bilan: row.bilanRounded,
          bilanSubcategories: row.bilanSubcategoriesRounded,
        })
      }

      lines.push(row.line)
      state.written++
      stats.written++

      if (verbose) {
        console.log(
          `${row.isCoherent ? '✔' : '✘'} ${simulation.id} (${simulation.model}) ` +
            `bilan=${row.bilanRounded} sous-catégories=${row.bilanSubcategoriesRounded}`
        )
      }
    } catch (error) {
      stats.errors++
      const message = error instanceof Error ? error.message : String(error)
      stats.firstError ??= message
      state.errors.push({ id: simulation.id, model: simulation.model, message })
      console.error(`\n✘ ${simulation.id} (${simulation.model}): ${message}`)
    }
  }

  return lines
}

/// ---------------------- Rapport ----------------------

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
    const version = stats.rulesVersion ?? getVersionFromModel(model)
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

  // Versions listées mais sans aucune simulation sur la période.
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

  console.log('\n📊 Compatibilité par version :')
  printTable(rows, [
    ['version', 'version'],
    ['models', 'modèles'],
    ['sampled', 'échantillon'],
    ['written', 'écrites'],
    ['incoherent', 'incohérentes'],
    ['errors', 'erreurs'],
    ['skipped', 'ignorées'],
    ['rules', 'règles'],
  ])
}

const report = (state: Checkpoint): void => {
  console.log('\n')
  console.log(`✅ ${state.written} simulations écrites`)
  console.log(`   période : ${state.startDate} → ${state.endDate}`)
  console.log(`   ${subcategories.length} colonnes de sous catégories`)

  if (samplePerVersion != null) printVersionReport()

  if (state.skipped.length > 0) {
    const byReason = new Map<string, number>()
    for (const { reason } of state.skipped) {
      byReason.set(reason, (byReason.get(reason) ?? 0) + 1)
    }
    console.log(`\n⏭  ${state.skipped.length} simulations ignorées :`)
    for (const [reason, count] of byReason) {
      console.log(`   ${reason} : ${count}`)
    }
  }

  if (state.errors.length > 0) {
    console.log(`\n✘ ${state.errors.length} simulations en erreur :`)
    for (const { id, model, message } of state.errors.slice(0, 20)) {
      console.log(`   ${id} (${model}): ${message}`)
    }
    if (state.errors.length > 20) {
      console.log(`   … et ${state.errors.length - 20} autre(s)`)
    }
  }

  if (state.incoherent.length === 0) {
    console.log(
      '\n✔ "bilan . sous catégories" égale "bilan" (au dixième) pour toutes les simulations'
    )
  } else {
    console.log(
      `\n⚠️  ${state.incoherent.length} simulations flaguées (bilan ≠ sous catégories) :`
    )
    for (const {
      id,
      version,
      bilan,
      bilanSubcategories,
    } of state.incoherent.slice(0, 20)) {
      console.log(
        `   ${id} (${version}): bilan=${bilan} sous-catégories=${bilanSubcategories}`
      )
    }
    if (state.incoherent.length > 20) {
      console.log(`   … et ${state.incoherent.length - 20} autre(s)`)
    }
  }
}

/// ---------------------- Main ----------------------

const main = async (): Promise<void> => {
  const url = resolveDatabaseUrl()

  console.log(`➡️  Export des sous catégories ${periodLabel}`)
  console.log(`➡️  Période : ${startDate} → ${endDate} (borne haute exclue)`)
  console.log(`➡️  ${subcategories.length} règles de sous catégories`)
  console.log(`➡️  Sortie : ${csvKey}`)
  console.log(`➡️  Fichier local : ${csvPath}`)
  if (samplePerVersion != null) {
    console.log(
      `➡️  Pré-vol : au plus ${samplePerVersion} simulation(s) par version (${sampleMode})`
    )
  }

  // Reprise : le checkpoint et le CSV vivent dans le bucket.
  //
  // Désactivée en mode pré-vol : l'échantillon est calculé en une seule requête,
  // « reprendre » rejouerait tout le tirage et dupliquerait les lignes.
  let checkpoint: Checkpoint | null = null
  if (resume && upload && samplePerVersion == null) {
    const raw = await downloadText(checkpointKey)
    if (raw) {
      checkpoint = JSON.parse(raw) as Checkpoint
      assertCheckpointCompatible(checkpoint)
      const existingCsv = await downloadText(csvKey)
      if (existingCsv != null) await writeFile(csvPath, existingCsv)
      console.log(
        `♻️  Reprise : ${checkpoint.written} simulations déjà écrites${
          checkpoint.lastDate ? `, dernière date ${checkpoint.lastDate}` : ''
        }`
      )
    }
  }

  const state: Checkpoint = checkpoint ?? {
    lastDate: null,
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
    console.log('➡️  Démarrage depuis le début')
  }

  // Heartbeat : Scalingo tue un one-off après 1 h sans écriture stdout.
  const heartbeat = setInterval(
    () => {
      console.log(
        `⏳ ${state.written} simulations écrites (${state.processed} traitées)`
      )
    },
    5 * 60 * 1000
  )

  /**
   * Envoie le CSV et le checkpoint dans le bucket.
   *
   * Contrairement au cache des règles, un échec ici est **fatal** : sans envoi,
   * le travail est perdu avec le conteneur one-off. On enveloppe l'erreur pour
   * donner l'opération et la clé, plutôt que la trace brute du SDK AWS.
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
      throw new Error(describeStorageError('écriture', csvKey, error))
    }
  }

  const UPLOAD_EVERY = 25

  try {
    if (samplePerVersion != null) {
      // Pré-vol : un seul lot, l'échantillon par version.
      const simulations = fetchSampledSimulations({
        url,
        schema,
        startDate,
        endDate,
        perVersion: samplePerVersion,
        sampleMode,
        sampleSeed,
        releaseVersionSql: SQL_RELEASE_VERSION,
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
          lastDate: state.lastDate,
          lastId: state.lastId,
          startDate,
          endDate,
          limit: batch,
        })
        if (simulations.length === 0) break

        const lines = await processBatch(simulations, state)

        // Le CSV du lot est écrit en premier, puis le checkpoint : en cas de
        // crash entre les deux, on peut au pire retraiter un lot.
        if (lines.length > 0) await appendFile(csvPath, `${lines.join('\n')}\n`)
        state.updatedAt = new Date().toISOString()
        await writeFile(checkpointPath, JSON.stringify(state, null, 2))
        process.stdout.write(`\r   ${state.written} simulations écrites`)

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

  report(state)

  // Le CSV est dans le bucket : le répertoire de travail ne sert plus à rien.
  // Avec `--no-upload`, on le conserve (c'est la sortie du run) et on indique
  // où il se trouve.
  if (upload) {
    await rm(workDir, { recursive: true, force: true })
  } else {
    console.log(`\nFichier conservé : ${csvPath}`)
  }

  if (state.errors.length > 0) process.exitCode = 1
}

main().catch((error) => {
  // Un run interrompu laisse un répertoire privé derrière lui : on le supprime
  // pour ne pas accumuler les CSV (situations de simulations) sur le disque.
  // Version synchrone : `process.exit()` devancerait un `rm` asynchrone.
  rmSync(workDir, { recursive: true, force: true })
  console.error(error)
  process.exit(1)
})
