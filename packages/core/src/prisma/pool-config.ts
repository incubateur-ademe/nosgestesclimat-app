import * as v from 'valibot'

/**
 * Pool settings for the Prisma client shared by every process.
 *
 * Prisma delegates pooling to the driver adapter, which uses `pg`: the
 * `connection_limit` parameter of `DATABASE_URL` (a Prisma 6 setting) caps
 * nothing, `max` does.
 */
interface PoolOptions {
  connectionString: string
  max: number
  connectionTimeoutMillis: number
  application_name: string
}

/**
 * Keeps the autoscaled fleet (10 web and 10 worker containers at most) under
 * the database plan's `max_connections`. Processes whose concurrency is
 * bounded below that — the workers — override it from their start script.
 */
const DEFAULT_POOL_MAX = 5

/**
 * Time a query may spend waiting for a free connection. `pg` waits forever by
 * default, which turns a saturated pool into requests held until the proxy
 * cuts them off.
 */
const ACQUIRE_TIMEOUT_MS = 5_000

/**
 * An unusable value falls back to the default rather than crashing the
 * container: the pool size is a safety cap, not a required setting.
 */
const PoolMaxSchema = v.fallback(
  v.pipe(v.unknown(), v.toNumber(), v.integer(), v.minValue(1)),
  DEFAULT_POOL_MAX
)

/**
 * `APP` and `CONTAINER` are the Scalingo runtime variables (`web-1`,
 * `worker-2`…): they make each process identifiable in `pg_stat_activity`.
 */
const resolveApplicationName = (env: NodeJS.ProcessEnv): string =>
  env.APP && env.CONTAINER ? `ngc-${env.APP}-${env.CONTAINER}` : 'ngc-local'

export const resolvePoolOptions = ({
  connectionString,
  env,
}: {
  connectionString: string
  env: NodeJS.ProcessEnv
}): PoolOptions => ({
  connectionString,
  max: v.parse(PoolMaxSchema, env.DATABASE_POOL_MAX),
  connectionTimeoutMillis: ACQUIRE_TIMEOUT_MS,
  application_name: resolveApplicationName(env),
})
