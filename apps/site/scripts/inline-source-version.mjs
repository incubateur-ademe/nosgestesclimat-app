import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Inlines the deployed commit into the processes no bundler ever sees (the
// worker, the cron): the value Next writes into the web bundles is out of their
// reach. `SOURCE_VERSION` only exists in the build environment, so the
// replacement happens here.
const MARKER = '__SOURCE_VERSION__'

const version = process.env.SOURCE_VERSION
// Scalingo injects `APP` in the build environment too, and it is the only
// reliable "this is a deployed build" signal here: `APP_ENV` is derived in
// `src/env/app-env.ts` from the site URL, so it is not in `process.env`.
const deployed = Boolean(process.env.APP)

if (!version && deployed) {
  console.error(
    'SOURCE_VERSION is missing on a Scalingo build: the worker and the cron would carry no version.'
  )
  process.exit(1)
}

if (!version) {
  console.log(`No SOURCE_VERSION: leaving ${MARKER} in place (local build).`)
  process.exit(0)
}

const processFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'observability',
  'process.ts'
)
const source = readFileSync(processFile, 'utf8')

if (!source.includes(MARKER)) {
  // Built twice from the same checkout: the marker already carries a commit.
  console.log(`No ${MARKER} left in ${processFile}, nothing to inline.`)
  process.exit(0)
}

writeFileSync(processFile, source.replace(MARKER, version))

console.log(`Inlined SOURCE_VERSION=${version} into ${processFile}.`)
