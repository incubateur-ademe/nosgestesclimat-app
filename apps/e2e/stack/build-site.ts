import dotenv from 'dotenv'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import {
  E2E_LOCAL_ENV_FILE,
  REPO_ROOT,
  SITE_E2E_ENV_FILE,
  templateDatabaseUrl,
} from './config.ts'
import { migrateTemplate } from './databases.ts'

/**
 * Builds the site the local suite runs on, as the CI `build` job does: the
 * e2e stacks then serve patched copies of it (see builds.ts).
 *
 * The build prerenders pages that query the database (e.g. /fr/actions): it
 * runs on the migrated template database.
 */
dotenv.config({ quiet: true })

await migrateTemplate()

execFileSync('pnpm', ['-F', '@nosgestesclimat/site', 'build'], {
  cwd: REPO_ROOT,
  env: {
    ...process.env,
    ...dotenv.parse(readFileSync(E2E_LOCAL_ENV_FILE)),
    ...dotenv.parse(readFileSync(SITE_E2E_ENV_FILE)),
    DATABASE_URL: templateDatabaseUrl(),
  },
  stdio: 'inherit',
})
