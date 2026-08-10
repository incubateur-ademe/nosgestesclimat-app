#!/usr/bin/env node
/**
 * Updates the version of @incubateur-ademe/nosgestesclimat in the app's
 * package.json files.
 *
 * Usage (from the repo root):
 *   NEW_VERSION=<version> node .github/scripts/update-model-version.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const PACKAGE = '@incubateur-ademe/nosgestesclimat'

const FILES = [
  'packages/core/package.json',
  'apps/server/package.json',
  'apps/site/package.json',
]

const newVersion = process.env.NEW_VERSION?.trim()
if (!newVersion) {
  console.error('❌ Missing NEW_VERSION environment variable')
  process.exit(1)
}

const readPkg = (file) => JSON.parse(readFileSync(join(ROOT, file), 'utf8'))
const writePkg = (file, pkg) =>
  writeFileSync(join(ROOT, file), JSON.stringify(pkg, null, 2) + '\n')

// 1. Determine the currently installed version (used to detect whether the
// update is a no-op, i.e. already up to date).
let currentVersion = null
for (const file of FILES) {
  const version = readPkg(file).dependencies?.[PACKAGE]
  if (typeof version === 'string') {
    const match = version.match(/\d+\.\d+\.\d+/)
    if (match) {
      currentVersion = match[0]
      break
    }
  }
}

if (!currentVersion) {
  console.error(`❌ Could not find the current version of ${PACKAGE}`)
  process.exit(1)
}

if (currentVersion === newVersion) {
  console.log(`✅ Already on ${newVersion}, nothing to do.`)
  process.exit(0)
}

console.log(`🔄 Updating ${PACKAGE} ${currentVersion} → ${newVersion}`)

// 2. Update each package.json.
let updated = 0
for (const file of FILES) {
  const pkg = readPkg(file)
  const deps = pkg.dependencies ?? {}

  let touched = false
  if (deps[PACKAGE] !== undefined) {
    deps[PACKAGE] = newVersion
    touched = true
  }

  if (touched) {
    writePkg(file, pkg)
    updated++
    console.log(`  ✔ ${relative(ROOT, join(ROOT, file))}`)
  }
}

if (updated === 0) {
  console.log('✅ No package.json to update.')
  process.exit(0)
}

console.log(`✅ Updated ${updated} file(s).`)
