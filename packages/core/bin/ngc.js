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
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as ts from 'typescript'

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
const coreTsconfig = resolve(coreDir, 'tsconfig.json')
const tsconfig = resolve(cwd, 'tsconfig.json')

console.log('tsconfig.json path:', tsconfig)
console.log('core tsconfig.json path:', coreTsconfig)
console.log('prisma.config.js path:', prismaConfig)

const formatDiagnostic = (diagnostic) =>
  ts.formatDiagnostic(diagnostic, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  })

const parseConfigFile = (configPath) => {
  const host = {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(formatDiagnostic(diagnostic))
    },
  }

  const result = ts.getParsedCommandLineOfConfigFile(configPath, {}, host)

  if (!result) {
    throw new Error(`Unable to parse tsconfig: ${configPath}`)
  }

  return result
}

const getFlattenedTsconfig = (coreTsconfigPath, cwdTsconfigPath) => {
  // 1. Fully resolve the cwd tsconfig (follows its own extends chain)
  const cwdParsed = parseConfigFile(cwdTsconfigPath)

  // 2. Read core tsconfig raw JSON — do NOT resolve extends (the relative path
  //    `../../tsconfig.json` is only valid in the monorepo, not in node_modules)
  const coreConfigResult = ts.readConfigFile(coreTsconfigPath, ts.sys.readFile)
  if (coreConfigResult.error) {
    throw new Error(formatDiagnostic(coreConfigResult.error))
  }

  const { extends: _stripped, ...coreRawConfig } = coreConfigResult.config

  // 3. Merge: use cwd resolved options as the base, then apply core's own options
  //    on top — exactly what `extends` would do, but resolved correctly regardless
  //    of where core is installed.
  const mergedParsed = ts.parseJsonConfigFileContent(
    coreRawConfig,
    ts.sys,
    dirname(coreTsconfigPath),
    cwdParsed.options // existingOptions = base options from cwd tsconfig
  )

  return {
    ...coreRawConfig,
    compilerOptions: Object.fromEntries(
      ts.serializeCompilerOptions(mergedParsed.options)
    ),
  }
}

switch (command) {
  case 'prepare':
    try {
      const flattenedConfig = getFlattenedTsconfig(coreTsconfig, tsconfig)

      writeFileSync(
        coreTsconfig,
        `${JSON.stringify(flattenedConfig, null, 2)}\n`
      )
      console.log('Flattened tsconfig written to core tsconfig.json')
    } catch (error) {
      console.error('Failed to prepare core tsconfig:', error)
      process.exit(1)
    }
    break
  case 'db:generate':
    execFileSync('prisma', ['generate', '--config', prismaConfig], {
      stdio: 'inherit',
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
    console.error(
      "  prepare      Merges tsconfig.json so that core's tsconfig.json works as a standalone config in node_modules"
    )
    console.error('  db:generate  Run prisma generate')
    console.error('  db:migrate   Run prisma migrate deploy')
    process.exit(1)
}
