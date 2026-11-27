import dotenv from 'dotenv'
import { spawn, type ChildProcess } from 'node:child_process'
import { closeSync, mkdirSync, openSync, readFileSync } from 'node:fs'
import { connect } from 'node:net'
import { join, relative } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import {
  distDir,
  E2E_LOCAL_ENV_FILE,
  LOGS_DIR,
  REPO_ROOT,
  serverPort,
  serverUrl,
  SITE_READY_PATH,
  sitePort,
  siteUrl,
  workerDatabaseUrl,
} from './config.ts'

interface StackProcess {
  name: string
  log: string
  child: ChildProcess
  stack: number
}

const READY_TIMEOUT_MS = 180_000
const STOP_TIMEOUT_MS = 10_000
const PORT_FREE_TIMEOUT_MS = 10_000

const running: StackProcess[] = []
let stopping = false
/** Stacks restarting on purpose: their processes exiting is not a failure. */
const restarting = new Set<number>()

/**
 * Environment of the stack processes: e2e-local.env over the inherited one, as
 * `source` did in the former stack script, then the worker's own values on
 * top (e2e-local.env sets `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).
 */
const stackEnv = (overrides: Record<string, string>): NodeJS.ProcessEnv => ({
  ...process.env,
  ...dotenv.parse(readFileSync(E2E_LOCAL_ENV_FILE)),
  ...overrides,
})

const isPortInUse = (port: number) =>
  new Promise<boolean>((resolve, reject) => {
    const socket = connect({ port, host: 'localhost' })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ECONNREFUSED') resolve(false)
      else reject(error)
    })
  })

/**
 * Fails when a port of the stacks is taken: typically by the processes of a
 * killed run, since their detached process groups outlive Playwright.
 */
export const assertPortsFree = async (ports: number[]) => {
  const busy = (
    await Promise.all(
      ports.map(async (port) => ((await isPortInUse(port)) ? port : undefined))
    )
  ).filter((port) => port !== undefined)

  if (busy.length > 0) {
    throw new Error(
      `Port(s) ${busy.join(', ')} already in use, most likely by the e2e stack of a killed run. ` +
        `Stop those processes first (e.g. \`lsof -ti tcp:${busy[0]} | xargs kill\`).`
    )
  }
}

const describeExit = (code: number | null, signal: NodeJS.Signals | null) =>
  signal ? `was killed by ${signal}` : `exited with code ${code}`

const start = (
  name: string,
  i: number,
  args: string[],
  env: Record<string, string>
): StackProcess => {
  mkdirSync(LOGS_DIR, { recursive: true })
  const log = join(LOGS_DIR, `${name}-${i}.log`)
  // A restart appends: the log keeps what the stack did before it.
  const fd = openSync(log, restarting.has(i) ? 'a' : 'w')

  // Its own process group, so that stopping it also stops what pnpm spawned.
  const child = spawn('pnpm', args, {
    cwd: REPO_ROOT,
    env: stackEnv(env),
    detached: true,
    stdio: ['ignore', fd, fd],
  })
  closeSync(fd)

  const stackProcess = { name: `${name}-${i}`, log, child, stack: i }
  running.push(stackProcess)

  // A stack process that dies, on start or mid-run, ends the run: it is a
  // failure to fix, not to retry, and its log tells why.
  child.once('exit', (code, signal) => {
    if (stopping || restarting.has(i)) return
    console.error(
      `\n[e2e] ${stackProcess.name} ${describeExit(code, signal)}: ending the run. ` +
        `See ${relative(process.cwd(), log)}.\n`
    )
    void stopStacks().finally(() => process.exit(1))
  })

  return stackProcess
}

/** Resolves once the process answers HTTP on `url`, whatever the status. */
const waitForHttp = async ({ name, log }: StackProcess, url: string) => {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(5_000) })
      return
    } catch {
      await sleep(500)
    }
  }
  throw new Error(`${name} did not answer on ${url} in time. See ${log}.`)
}

const startServer = async (i: number) => {
  const server = start(
    'server',
    i,
    ['-F', '@nosgestesclimat/server', 'start:e2e'],
    {
      PORT: String(serverPort(i)),
      DATABASE_URL: workerDatabaseUrl(i),
      ORIGIN: siteUrl(i),
      SERVER_URL: serverUrl(i),
    }
  )
  await waitForHttp(server, serverUrl(i))
}

/** Origins of stack `i`, for the code that reads them at runtime. */
const siteEnv = (i: number) => ({
  DATABASE_URL: workerDatabaseUrl(i),
  NEXT_PUBLIC_SITE_URL: siteUrl(i),
  NEXT_PUBLIC_SERVER_URL: serverUrl(i),
})

const startSite = async (i: number, { dev }: { dev: boolean }) => {
  const site = start(
    'site',
    i,
    [
      '-F',
      '@nosgestesclimat/site',
      dev ? 'dev:e2e' : 'start:e2e',
      '--port',
      String(sitePort(i)),
    ],
    // `next dev` keeps the default `.next`: given another directory, it would
    // point next-env.d.ts, hence the site's typecheck, at it.
    dev ? siteEnv(i) : { ...siteEnv(i), NEXT_DIST_DIR: distDir(i) }
  )
  await waitForHttp(site, `${siteUrl(i)}${SITE_READY_PATH}`)
}

/** The site worker runs from source: nothing of it is inlined. */
const startSiteWorker = (i: number) =>
  start(
    'worker',
    i,
    ['-F', '@nosgestesclimat/site', 'start:worker:e2e'],
    siteEnv(i)
  )

/**
 * Starts stack `i`: API, site and site worker, on database ngc_e2e_<i>. In dev
 * mode the site runs `next dev`, which inlines the worker's URLs as it
 * compiles.
 */
export const startStack = async (i: number, { dev }: { dev: boolean }) => {
  startSiteWorker(i)
  await Promise.all([startServer(i), startSite(i, { dev })])
}

const stop = ({ child }: StackProcess) =>
  new Promise<void>((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null || !child.pid) {
      resolve()
      return
    }
    const kill = (signal: NodeJS.Signals) => {
      try {
        process.kill(-child.pid!, signal)
      } catch {
        // The group is already gone.
      }
    }
    const timeout = setTimeout(() => kill('SIGKILL'), STOP_TIMEOUT_MS)
    child.once('exit', () => {
      clearTimeout(timeout)
      // pnpm may exit before the app it spawned: no straggler left on a port.
      kill('SIGKILL')
      resolve()
    })
    kill('SIGTERM')
  })

/** A killed process group releases its ports a moment after it exits. */
const waitPortsFree = async (ports: number[]) => {
  const deadline = Date.now() + PORT_FREE_TIMEOUT_MS
  while (Date.now() < deadline) {
    const busy = await Promise.all(ports.map(isPortInUse))
    if (busy.every((inUse) => !inUse)) return
    await sleep(100)
  }
  throw new Error(`Port(s) ${ports.join(', ')} still in use after a stop.`)
}

/** Stops stack `i` and returns once its ports are free. */
const stopStack = async (i: number) => {
  const stackProcesses = running.filter((entry) => entry.stack === i)
  await Promise.all(stackProcesses.map(stop))
  for (const entry of stackProcesses) running.splice(running.indexOf(entry), 1)
  await waitPortsFree([sitePort(i), serverPort(i)])
}

/**
 * Restarts stack `i` on its empty database. The site holds its data cache in
 * memory (`use cache`), so only a fresh process forgets the previous test.
 */
export const restartStack = async (i: number, { dev }: { dev: boolean }) => {
  restarting.add(i)
  try {
    await stopStack(i)
    await startStack(i, { dev })
  } finally {
    restarting.delete(i)
  }
}

export const stopStacks = async () => {
  stopping = true
  await Promise.all(running.map(stop))
}
