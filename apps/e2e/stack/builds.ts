import { execFileSync } from 'node:child_process'
import { existsSync, type Dirent } from 'node:fs'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import {
  BUILT_SERVER_ORIGIN,
  BUILT_SITE_ORIGIN,
  distDir,
  serverPort,
  SITE_DIR,
  sitePort,
} from './config.ts'

/**
 * Each site instance serves its own copy of the one e2e build, with the URLs
 * inlined at build time (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SERVER_URL`)
 * replaced by the worker's: site `i` knows its own origin and talks to API `i`.
 */

const SOURCE_DIR = join(SITE_DIR, '.next')
const STAMP_FILE = '.e2e-patched'

/**
 * What `next start` reads from the build: `node_modules/` holds relative
 * symlinks to the external packages (ioredis, pg…), which still resolve from
 * a sibling of `.next`. Everything else is left out: `cache/`, `types/` and
 * `diagnostics/` are not needed, `trace*` are build logs, and `dev/` (the
 * output of `next dev`) weighs several GB, full of `localhost:3000`.
 */
const COPIED_DIRECTORIES = new Set([
  'server',
  'static',
  'build',
  'node_modules',
])
const isCopiedFile = (name: string) =>
  name === 'BUILD_ID' || name.endsWith('.json') || name.endsWith('.js')

const replacements = (i: number) =>
  [
    [BUILT_SITE_ORIGIN, `localhost:${sitePort(i)}`],
    [BUILT_SERVER_ORIGIN, `localhost:${serverPort(i)}`],
  ].flatMap(([from, to]) =>
    // Plain, and URL-encoded as in a `?url=` or `redirect=` parameter.
    ['', '%3A', '%3a'].map((separator) =>
      separator
        ? [from.replace(':', separator), to.replace(':', separator)]
        : [from, to]
    )
  ) as [string, string][]

const BUILT_ORIGIN_PATTERNS = replacements(0).map(([from]) => Buffer.from(from))

/**
 * Regular files under `dir`. Symlinks are never followed: `readdir`'s
 * `recursive` option would, right into the workspace's node_modules.
 */
const listFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(path)))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

const readCopiedEntries = async () =>
  (await readdir(SOURCE_DIR, { withFileTypes: true })).filter((entry) =>
    entry.isDirectory()
      ? COPIED_DIRECTORIES.has(entry.name)
      : entry.isFile() && isCopiedFile(entry.name)
  )

/**
 * Files of the build that hold a built origin, relative to it. Every copy is a
 * clone of the same build, so they are searched once, in the build itself, and
 * only they are patched in each copy (a few dozen out of thousands).
 *
 * Fails on a binary file (one holding a NUL byte) that holds a built origin:
 * it cannot be patched as text.
 */
const findFilesToPatch = async (entries: Dirent[]) => {
  const files: string[] = []
  for (const entry of entries) {
    const path = join(SOURCE_DIR, entry.name)
    files.push(...(entry.isDirectory() ? await listFiles(path) : [path]))
  }

  const toPatch: string[] = []
  const binaries: string[] = []
  for (const file of files) {
    const content = await readFile(file)
    if (!BUILT_ORIGIN_PATTERNS.some((pattern) => content.includes(pattern))) {
      continue
    }
    ;(content.includes(0) ? binaries : toPatch).push(relative(SOURCE_DIR, file))
  }

  if (binaries.length > 0) {
    const list = binaries.map((file) => `  - .next/${file}`).join('\n')
    throw new Error(
      `${BUILT_SITE_ORIGIN} or ${BUILT_SERVER_ORIGIN} is in binary files of the build, which cannot be patched:\n${list}`
    )
  }
  return toPatch
}

const copyBuild = async (target: string, entries: Dirent[]) => {
  await mkdir(target, { recursive: true })
  for (const entry of entries) {
    const from = join(SOURCE_DIR, entry.name)
    const to = join(target, entry.name)
    if (process.platform === 'darwin') {
      // Copy-on-write clone (APFS): near instant, and no extra disk space
      // until a file is patched.
      execFileSync('cp', ['-cR', from, to])
    } else {
      await cp(from, to, { recursive: true })
    }
  }
}

/**
 * Replaces the built origins in the given files of the copy. Replacements keep
 * the byte length, so they are made in place on the raw bytes: no decoding,
 * no offset shifted in a source map.
 */
const patchBuild = async (target: string, i: number, files: string[]) => {
  const patterns = replacements(i).map(
    ([from, to]) => [Buffer.from(from), Buffer.from(to)] as const
  )

  for (const file of files) {
    const path = join(target, file)
    const content = await readFile(path)
    for (const [from, to] of patterns) {
      for (
        let at = content.indexOf(from);
        at !== -1;
        at = content.indexOf(from, at + from.length)
      ) {
        to.copy(content, at)
      }
    }
    await writeFile(path, content)
  }
}

const readBuildId = async () => {
  const file = join(SOURCE_DIR, 'BUILD_ID')
  if (!existsSync(file)) {
    throw new Error(
      `No site build in ${SOURCE_DIR}: run \`pnpm -F @nosgestesclimat/e2e build:site\` first.`
    )
  }
  return (await readFile(file, 'utf8')).trim()
}

const readStamp = async (target: string) => {
  try {
    return await readFile(join(target, STAMP_FILE), 'utf8')
  } catch {
    return undefined
  }
}

const stampOf = (i: number, buildId: string) =>
  JSON.stringify({ buildId, sitePort: sitePort(i), serverPort: serverPort(i) })

/**
 * Prepares the builds of sites `0..n-1` in apps/site/.next-e2e-<i>.
 *
 * The stamp is written last: a copy is reused only when a previous run patched
 * it to the end, from the same build and for the same ports. Any other copy, a
 * half-patched one included, is deleted and redone.
 */
export const prepareBuilds = async (n: number) => {
  const buildId = await readBuildId()
  const stale: number[] = []
  for (let i = 0; i < n; i++) {
    const target = join(SITE_DIR, distDir(i))
    if ((await readStamp(target)) !== stampOf(i, buildId)) stale.push(i)
  }
  if (stale.length === 0) return

  const entries = await readCopiedEntries()
  const files = await findFilesToPatch(entries)

  await Promise.all(
    stale.map(async (i) => {
      const target = join(SITE_DIR, distDir(i))
      console.log(`[e2e] Copying the site build to apps/site/${distDir(i)}…`)
      await rm(target, { recursive: true, force: true })
      await copyBuild(target, entries)
      await patchBuild(target, i, files)
      await writeFile(join(target, STAMP_FILE), stampOf(i, buildId))
    })
  )
}
