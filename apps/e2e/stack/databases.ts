import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import pg from 'pg'
import {
  adminDatabaseUrl,
  CORE_DIR,
  TEMPLATE_DATABASE,
  templateDatabaseUrl,
  workerDatabase,
} from './config.ts'

const withAdminClient = async <T>(run: (client: pg.Client) => Promise<T>) => {
  const client = new pg.Client({ connectionString: adminDatabaseUrl() })
  await client.connect()
  try {
    return await run(client)
  } finally {
    await client.end()
  }
}

/**
 * Creates the template database when missing and applies the migrations to it,
 * with core's migration bin (the one the server's `db:migrate` runs).
 */
export const migrateTemplate = async () => {
  await withAdminClient(async (client) => {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEMPLATE_DATABASE]
    )
    if (!rowCount) {
      await client.query(`CREATE DATABASE "${TEMPLATE_DATABASE}"`)
    }
  })

  execFileSync(process.execPath, [join(CORE_DIR, 'bin/db-migrate.js')], {
    cwd: CORE_DIR,
    env: { ...process.env, DATABASE_URL: templateDatabaseUrl() },
    stdio: 'inherit',
  })
}

/**
 * Migrates the template, then recreates the `n` worker databases from it:
 * each starts empty, with the migrated schema.
 *
 * `FORCE` closes the connections a previous run may have left behind. The
 * databases are created one at a time: Postgres refuses to copy a template
 * that another `CREATE DATABASE` is reading.
 */
export const prepareDatabases = async (n: number) => {
  await migrateTemplate()

  await withAdminClient(async (client) => {
    for (let i = 0; i < n; i++) {
      const database = workerDatabase(i)
      await client.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`)
      await client.query(
        `CREATE DATABASE "${database}" TEMPLATE "${TEMPLATE_DATABASE}"`
      )
    }
  })
}
