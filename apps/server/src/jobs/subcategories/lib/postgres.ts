/**
 * Accès Postgres pour l'export des sous catégories.
 *
 * On passe par `psql` (présent dans l'image Scalingo) plutôt que par le client
 * Prisma : la pagination « keyset » et l'agrégation JSON sont plus lisibles en
 * SQL brut, et cela évite de dépendre du schéma Prisma pour un job d'analyse.
 *
 * ⚠️ `DATABASE_URL` contient des paramètres destinés à Prisma
 * (`connection_limit`) que libpq refuse. On nettoie l'URL avant de la passer à
 * `psql`, et on préfère `SCALINGO_POSTGRESQL_URL` quand elle existe.
 */

import { execFileSync } from 'node:child_process'

export type Simulation = {
  id: string
  date: string
  model: string
  progression: number
  situation: Record<string, unknown>
}

/** Paramètres d'URL que libpq comprend (le reste est retiré). */
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
 * Nettoie une URL de connexion pour libpq.
 *
 * `DATABASE_URL` est construite pour Prisma : `?sslmode=require&connection_limit=5`.
 * `psql` échoue sur `connection_limit` (« invalid URI query parameter »). On ne
 * garde donc que les paramètres connus de libpq.
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
 * URL retenue pour `psql` : `SCALINGO_POSTGRESQL_URL` de préférence (déjà au
 * format libpq), sinon `DATABASE_URL` nettoyée.
 */
export const resolveDatabaseUrl = (
  env: NodeJS.ProcessEnv = process.env
): string => {
  if (env.SCALINGO_POSTGRESQL_URL) return env.SCALINGO_POSTGRESQL_URL
  if (env.DATABASE_URL) return sanitizeDatabaseUrl(env.DATABASE_URL)
  throw new Error(
    'Aucune URL Postgres : ni SCALINGO_POSTGRESQL_URL ni DATABASE_URL.'
  )
}

const MAX_BUFFER = 1024 * 1024 * 200

/** Exécute une requête et renvoie le JSON agrégé par `json_agg`. */
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
 * Lot de simulations, triées par `date` (puis `id`). La pagination « keyset »
 * reste stable même si des simulations sont insérées pendant l'exécution.
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
 * Au plus `perVersion` simulations par version de modèle. Une version couvre
 * plusieurs modèles (`FR-fr-…`, `BE-fr-…`) : l'échantillon est pris sur la
 * version, pas sur chaque modèle.
 */
export const fetchSampledSimulations = ({
  url,
  schema,
  startDate,
  endDate,
  perVersion,
  sampleMode,
  sampleSeed,
  releaseVersionSql,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  perVersion: number
  sampleMode: 'first' | 'spread' | 'random'
  sampleSeed: string
  releaseVersionSql: string
  versionFilter: string[] | null
}): Simulation[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s.date >= timestamp '${startDate}'`)
  if (endDate) conditions.push(`s.date < timestamp '${endDate}'`)
  if (versionFilter != null) {
    const list = versionFilter.map((version) => `'${version}'`).join(', ')
    conditions.push(`${releaseVersionSql} in (${list})`)
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  let inner: string
  if (sampleMode === 'spread') {
    // Un point par tranche chronologique : `ntile` découpe la version en
    // `perVersion` paquets, on garde la première simulation de chacun.
    inner = `
      select id, date, model, progression, situation from (
        select id, date, model, progression, situation,
          row_number() over (partition by version, bucket order by date, id) as rn
        from (
          select s.id, s.date, s.model, s.progression, s.situation,
            ${releaseVersionSql} as version,
            ntile(${perVersion}) over (
              partition by ${releaseVersionSql} order by s.date, s.id
            ) as bucket
          from $schema."Simulation" s
          ${where}
        ) bucketed
      ) ranked
      where rn = 1
    `
  } else if (sampleMode === 'random') {
    // Tirage reproductible sans `setseed()` (qui s'appliquerait à toute la
    // session) : l'ordre dépend de `md5(id + graine)`.
    inner = `
      select id, date, model, progression, situation
      from (
        select s.id, s.date, s.model, s.progression, s.situation,
          row_number() over (
            partition by ${releaseVersionSql}
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
          row_number() over (partition by ${releaseVersionSql} order by s.date, s.id) as rn
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

/** Nombre total de simulations par version, pour situer l'échantillon. */
export const fetchVersionCounts = ({
  url,
  schema,
  startDate,
  endDate,
  releaseVersionSql,
  versionFilter,
}: {
  url: string
  schema: string
  startDate: string | null
  endDate: string | null
  releaseVersionSql: string
  versionFilter: string[] | null
}): { version: string; count: number; models: number }[] => {
  const conditions: string[] = []
  if (startDate) conditions.push(`s.date >= timestamp '${startDate}'`)
  if (endDate) conditions.push(`s.date < timestamp '${endDate}'`)
  if (versionFilter != null) {
    const list = versionFilter.map((version) => `'${version}'`).join(', ')
    conditions.push(`${releaseVersionSql} in (${list})`)
  }
  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : ''

  return queryJson({
    url,
    schema,
    query: `
      select coalesce(json_agg(t), '[]') from (
        select ${releaseVersionSql} as version, count(*)::int as count,
          count(distinct s.model)::int as models
        from $schema."Simulation" s
        ${where}
        group by 1
        order by 1
      ) t;
    `,
  })
}
