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
  date: string
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

/** Runs a query and returns the JSON aggregated by `json_agg`. */
export const queryJson = <T>({
  url,
  schema,
  query,
}: {
  url: string
  schema: string
  query: string
}): T => {
  const stdout = execFileSync(
    'psql',
    [
      url,
      '-v',
      'ON_ERROR_STOP=1',
      '-t',
      '-A',
      '-c',
      query.replaceAll('$schema', schema),
    ],
    { maxBuffer: MAX_BUFFER, encoding: 'utf8' }
  )
  return JSON.parse(stdout) as T
}

/**
 * A batch of simulations ordered by `date` (then `id`). Keyset pagination stays
 * stable even if simulations are inserted while the run is in progress.
 */
export const fetchSimulationBatch = ({
  url,
  schema,
  lastDate,
  lastId,
  startDate,
  endDate,
  limit,
}: {
  url: string
  schema: string
  lastDate: string | null
  lastId: string | null
  startDate: string | null
  endDate: string | null
  limit: number
}): Simulation[] => {
  const conditions: string[] = []
  if (lastDate && lastId) {
    conditions.push(`(date, id) > (timestamp '${lastDate}', '${lastId}'::uuid)`)
  } else if (startDate) {
    conditions.push(`date >= timestamp '${startDate}'`)
  }
  if (endDate) conditions.push(`date < timestamp '${endDate}'`)

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  return queryJson<Simulation[]>({
    url,
    schema,
    query: `
      select coalesce(json_agg(t), '[]') from (
        select id, date, model, progression, situation
        from $schema."Simulation"
        ${where}
        order by date, id
        limit ${limit}
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
  versionSql,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  perVersion: number
  sampleMode: 'first' | 'spread' | 'random'
  sampleSeed: string
  versionSql: string
  versionFilter: string[] | null
}): Simulation[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s.date >= timestamp '${startDate}'`)
  if (endDate) conditions.push(`s.date < timestamp '${endDate}'`)
  if (versionFilter != null) {
    const list = versionFilter.map((version) => `'${version}'`).join(', ')
    conditions.push(`${versionSql} in (${list})`)
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  let inner: string
  if (sampleMode === 'spread') {
    // One point per chronological slice: `ntile` splits the version into
    // `perVersion` buckets, and the first simulation of each is kept.
    inner = `
      select id, date, model, progression, situation from (
        select id, date, model, progression, situation,
          row_number() over (partition by version, bucket order by date, id) as rn
        from (
          select s.id, s.date, s.model, s.progression, s.situation,
            ${versionSql} as version,
            ntile(${perVersion}) over (
              partition by ${versionSql} order by s.date, s.id
            ) as bucket
          from $schema."Simulation" s
          ${where}
        ) bucketed
      ) ranked
      where rn = 1
    `
  } else if (sampleMode === 'random') {
    // Reproducible draw without `setseed()` (which would apply to the whole
    // session): the order depends on `md5(id + seed)`.
    inner = `
      select id, date, model, progression, situation
      from (
        select s.id, s.date, s.model, s.progression, s.situation,
          row_number() over (
            partition by ${versionSql}
            order by md5(s.id::text || '${sampleSeed.replaceAll("'", "''")}')
          ) as rn
        from $schema."Simulation" s
        ${where}
      ) ranked
      where rn <= ${perVersion}
    `
  } else {
    inner = `
      select id, date, model, progression, situation
      from (
        select s.id, s.date, s.model, s.progression, s.situation,
          row_number() over (partition by ${versionSql} order by s.date, s.id) as rn
        from $schema."Simulation" s
        ${where}
      ) ranked
      where rn <= ${perVersion}
    `
  }

  return queryJson<Simulation[]>({
    url,
    schema,
    query: `select coalesce(json_agg(t), '[]') from (${inner} order by date, id) t;`,
  })
}

/** Total number of simulations per version, to size the sample. */
export const fetchVersionCounts = ({
  url,
  schema,
  startDate,
  endDate,
  versionSql,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  versionSql: string
  versionFilter: string[] | null
}): { version: string; count: number; models: number }[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s.date >= timestamp '${startDate}'`)
  if (endDate) conditions.push(`s.date < timestamp '${endDate}'`)
  if (versionFilter != null) {
    const list = versionFilter.map((version) => `'${version}'`).join(', ')
    conditions.push(`${versionSql} in (${list})`)
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  return queryJson({
    url,
    schema,
    query: `
      select coalesce(json_agg(t), '[]') from (
        select ${versionSql} as version, count(*)::int as count,
          count(distinct s.model)::int as models
        from $schema."Simulation" s
        ${where}
        group by 1
        order by 1
      ) t;
    `,
  })
}
