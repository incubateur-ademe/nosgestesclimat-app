/**
 * Postgres access for the sub-category export.
 *
 * We go through `psql` (provided by the Scalingo image) rather than the Prisma
 * client: keyset pagination and JSON aggregation read better in raw SQL, and it
 * avoids depending on the Prisma schema for an analysis job.
 *
 * `DATABASE_URL` carries Prisma-only parameters (`connection_limit`) that libpq
 * rejects, hence `sanitizeDatabaseUrl`. `SCALINGO_POSTGRESQL_URL` is preferred
 * when available.
 */

import { execFileSync } from 'node:child_process'

export type Simulation = {
  id: string
  /**
   * Insertion timestamp: the indexed column, used for paging and exported as
   * the `date` column of the CSV.
   */
  createdAt: string
  model: string
  progression: number
  situation: Record<string, unknown>
}

/** URL parameters libpq understands (the rest is dropped). */
const LIBPQ_PARAMS = new Set([
  'sslmode',
  'connect_timeout',
  'application_name',
  'options',
  'target_session_attrs',
  'gssencmode',
  'channel_binding',
])

/**
 * Cleans a connection URL for libpq.
 *
 * `DATABASE_URL` is built for Prisma: `?sslmode=require&connection_limit=5`.
 * `psql` fails on `connection_limit` ("invalid URI query parameter"), so only
 * parameters known to libpq are kept.
 */
export const sanitizeDatabaseUrl = (raw: string): string => {
  const url = new URL(raw)
  const kept = [...url.searchParams.entries()].filter(([key]) =>
    LIBPQ_PARAMS.has(key)
  )
  url.search = ''
  for (const [key, value] of kept) url.searchParams.set(key, value)
  return url.toString()
}

/**
 * URL used for `psql`: `SCALINGO_POSTGRESQL_URL` first (already in libpq form),
 * otherwise a cleaned `DATABASE_URL`.
 */
export const resolveDatabaseUrl = (
  env: NodeJS.ProcessEnv = process.env
): string => {
  if (env.SCALINGO_POSTGRESQL_URL) return env.SCALINGO_POSTGRESQL_URL
  if (env.DATABASE_URL) return sanitizeDatabaseUrl(env.DATABASE_URL)
  throw new Error(
    'No Postgres URL: neither SCALINGO_POSTGRESQL_URL nor DATABASE_URL.'
  )
}

const MAX_BUFFER = 1024 * 1024 * 200

type QueryVariables = Record<string, string | number | null | undefined>

/**
 * Removes the password from a connection URL so it is not exposed in the
 * process arguments (`ps` shows them to every user of the host). It is passed
 * to psql through `PGPASSWORD` instead.
 */
const splitPassword = (
  url: string
): { url: string; password: string | null } => {
  try {
    const parsed = new URL(url)
    if (!parsed.password) return { url, password: null }
    const password = decodeURIComponent(parsed.password)
    parsed.password = ''
    return { url: parsed.toString(), password }
  } catch {
    return { url, password: null }
  }
}

/**
 * Runs a query and returns the JSON aggregated by `json_agg`.
 *
 * Values are bound as psql variables: `:'name'` is rendered by psql as a
 * properly quoted string literal, `:"name"` as a quoted identifier. An
 * apostrophe or a double quote in a value can therefore not break out of SQL.
 *
 * The query goes through stdin, not `-c`: psql only expands variables when it
 * reads from stdin or a file.
 */
export const queryJson = <T>({
  url,
  query,
  variables = {},
}: {
  url: string
  query: string
  variables?: QueryVariables
}): T => {
  const { url: safeUrl, password } = splitPassword(url)
  const args = [safeUrl, '-v', 'ON_ERROR_STOP=1', '-t', '-A']
  for (const [name, value] of Object.entries(variables)) {
    if (value == null) continue
    args.push('-v', `${name}=${value}`)
  }

  const stdout = execFileSync('psql', args, {
    input: query,
    maxBuffer: MAX_BUFFER,
    encoding: 'utf8',
    env: password ? { ...process.env, PGPASSWORD: password } : process.env,
  })
  return JSON.parse(stdout) as T
}

const assertInteger = (name: string, value: number): number => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be an integer >= 1, got ${value}`)
  }
  return value
}

/**
 * A batch of simulations ordered by `createdAt` (then `id`).
 *
 * Everything goes through `createdAt`: it is the only indexed column
 * (`Simulation_createdAt_idx`) and the only one never rewritten, unlike
 * `updatedAt`. `Simulation.date` is not read at all — it is set by the browser
 * without validation, so it can be backdated by years or overflow to 2038.
 */
export const fetchSimulationBatch = ({
  url,
  schema,
  lastCreatedAt,
  lastId,
  startDate,
  endDate,
  limit,
}: {
  url: string
  schema: string
  lastCreatedAt: string | null
  lastId: string | null
  startDate: string | null
  endDate: string | null
  limit: number
}): Simulation[] => {
  const cursor =
    lastCreatedAt && lastId
      ? `("createdAt", id) > (:'lastCreatedAt'::timestamp, :'lastId'::uuid)`
      : startDate
        ? `"createdAt" >= :'startDate'::timestamp`
        : 'true'
  const upper = endDate ? `and "createdAt" < :'endDate'::timestamp` : ''

  return queryJson<Simulation[]>({
    url,
    variables: {
      schema,
      lastCreatedAt,
      lastId,
      startDate,
      endDate,
      limit: assertInteger('--batch', limit),
    },
    query: `
      /* sql */
      select coalesce(json_agg(t), '[]') from (
        select id, "createdAt", model, progression, situation
        from :"schema"."Simulation"
        where ${cursor} ${upper}
        order by "createdAt", id
        limit :'limit'::int
      ) t;
    `,
  })
}

/**
 * At most `perVersion` simulations per model version. A version spans several
 * models (`FR-fr-…`, `BE-fr-…`): the sample is taken per version, not per model.
 */
export const fetchSampledSimulations = ({
  url,
  schema,
  startDate,
  endDate,
  perVersion,
  sampleMode,
  sampleSeed,
  versionExpression,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  perVersion: number
  sampleMode: 'first' | 'spread' | 'random'
  sampleSeed: string
  /** Internal SQL expression (see `SQL_VERSION`), never built from input. */
  versionExpression: string
  versionFilter: string[] | null
}): Simulation[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s."createdAt" >= :'startDate'::timestamp`)
  if (endDate) conditions.push(`s."createdAt" < :'endDate'::timestamp`)
  if (versionFilter != null && versionFilter.length > 0) {
    conditions.push(
      `${versionExpression} = any(string_to_array(:'versionFilter', ','))`
    )
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  let inner: string
  if (sampleMode === 'spread') {
    // One point per chronological slice: `ntile` splits the version into
    // `perVersion` buckets, and the first simulation of each is kept.
    inner = `
      select id, "createdAt", model, progression, situation from (
        select id, "createdAt", model, progression, situation,
          row_number() over (partition by version, bucket order by "createdAt", id) as rn
        from (
          select s.id, s."createdAt", s.model, s.progression, s.situation,
            ${versionExpression} as version,
            ntile(:'perVersion'::int) over (
              partition by ${versionExpression} order by s."createdAt", s.id
            ) as bucket
          from :"schema"."Simulation" s
          ${where}
        ) bucketed
      ) ranked
      where rn = 1
    `
  } else if (sampleMode === 'random') {
    // Reproducible draw without `setseed()` (which would apply to the whole
    // session): the order depends on `md5(id + seed)`.
    inner = `
      select id, "createdAt", model, progression, situation
      from (
        select s.id, s."createdAt", s.model, s.progression, s.situation,
          row_number() over (
            partition by ${versionExpression}
            order by md5(s.id::text || :'sampleSeed')
          ) as rn
        from :"schema"."Simulation" s
        ${where}
      ) ranked
      where rn <= :'perVersion'::int
    `
  } else {
    inner = `
      select id, "createdAt", model, progression, situation
      from (
        select s.id, s."createdAt", s.model, s.progression, s.situation,
          row_number() over (partition by ${versionExpression} order by s."createdAt", s.id) as rn
        from :"schema"."Simulation" s
        ${where}
      ) ranked
      where rn <= :'perVersion'::int
    `
  }

  return queryJson<Simulation[]>({
    url,
    variables: {
      schema,
      startDate,
      endDate,
      perVersion: assertInteger('--sample-per-version', perVersion),
      sampleSeed,
      versionFilter: versionFilter?.join(',') ?? '',
    },
    query: `
      /* sql */
      select coalesce(json_agg(t), '[]') from (${inner} order by "createdAt", id) t;
    `,
  })
}

/** Total number of simulations per version, to size the sample. */
export const fetchVersionCounts = ({
  url,
  schema,
  startDate,
  endDate,
  versionExpression,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  /** Internal SQL expression (see `SQL_VERSION`), never built from input. */
  versionExpression: string
  versionFilter: string[] | null
}): { version: string; count: number; models: number }[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s."createdAt" >= :'startDate'::timestamp`)
  if (endDate) conditions.push(`s."createdAt" < :'endDate'::timestamp`)
  if (versionFilter != null && versionFilter.length > 0) {
    conditions.push(
      `${versionExpression} = any(string_to_array(:'versionFilter', ','))`
    )
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  return queryJson({
    url,
    variables: {
      schema,
      startDate,
      endDate,
      versionFilter: versionFilter?.join(',') ?? '',
    },
    query: `
      /* sql */
      select coalesce(json_agg(t), '[]') from (
        select ${versionExpression} as version, count(*)::int as count,
          count(distinct s.model)::int as models
        from :"schema"."Simulation" s
        ${where}
        group by 1
        order by 1
      ) t;
    `,
  })
}
