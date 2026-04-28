#!/usr/bin/env node

/**
 * NGC CLI — bin entry point for @nosgestesclimat/core.
 *
 * WHY THIS EXISTS
 * ---------------
 * Database schema and migrations live in `packages/core`, but each deployed app
 * (e.g. `apps/server`, `apps/site`) is responsible for running its own migrations
 * at deploy time.
 *
 * On Scalingo, only the app's PROJECT_DIR is available at release time — the rest
 * of the monorepo is not present. We cannot call `pnpm -F core db:migrate` from
 * a subdirectory because the workspace root is missing.
 *
 * The solution: `@nosgestesclimat/core` is hoisted as a regular node_modules
 * dependency of each app, so its `bin/ngc.ts` is accessible via the `ngc` binary
 * in the app's local node_modules/.bin. Each app's release command can therefore
 * just run:
 *
 * `ngc db:migrate`
 *
 * The script resolves the core package location at runtime (via import.meta.resolve)
 * so it always points to the correct prisma.config.ts regardless of cwd.
 */

import { execFileSync } from 'node:child_process'
import console from 'node:console'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const command = process.argv[2]
const cwd = process.cwd()

console.log(`Running command '${command}' from directory '${cwd}'`)

try {
  console.log('Loading environment variables from .env file…')
  process.loadEnvFile(resolve(cwd, '.env'))
  console.log('Environment variables loaded from .env file')
} catch {
  console.log('.env not found or unreadable, continue with existing env')
}

// Resolve the @nosgestesclimat/core package root via its main export (src/index.ts → src/ → root)
const coreMain = fileURLToPath(import.meta.resolve('@nosgestesclimat/core'))
const coreDir = resolve(dirname(coreMain), '..')
const prismaConfig = resolve(coreDir, 'prisma.config.js')
const tsconfig = resolve(cwd, 'tsconfig.json')

console.log('tsconfig.json path:', tsconfig)
console.log('prisma.config.js path:', prismaConfig)

switch (command) {
  case 'db:generate':
    execFileSync('prisma', ['generate', '--config', prismaConfig], {
      stdio: 'inherit',
      env: { ...process.env, TS_NODE_PROJECT: tsconfig },
    })
    break
  case 'db:migrate':
    execFileSync('prisma', ['migrate', 'deploy', '--config', prismaConfig], {
      stdio: 'inherit',
    })
    break
  default:
    console.error(`Unknown command: ${command}`)
    console.error('Usage: ngc <command>')
    console.error('')
    console.error('Commands:')
    console.error('  db:generate  Run prisma generate')
    console.error('  db:migrate   Run prisma migrate deploy')
    process.exit(1)
}
