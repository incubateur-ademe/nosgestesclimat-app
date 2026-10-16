import { readServerEnv } from '../env/server-contract.ts'
import {
  captureException,
  flushErrorCapture,
  initErrorCapture,
} from './capture.ts'
import { initObservability, shutdownObservability } from './setup.ts'

// Replaced at build by `scripts/inline-source-version.mjs` with the deployed
// commit: the value Next inlines for the web never reaches these processes.
const version = '__SOURCE_VERSION__'

/**
 * Wires a process that is not the Next server: the error reporter, then the OTLP
 * exports. The environment is the site's own contract, read here rather than at
 * module load so that the caller can report what fails.
 */
export function initProcessObservability(service: string): void {
  const env = readServerEnv()

  initErrorCapture({ dsn: env.NEXT_PUBLIC_SENTRY_DSN })

  // No token or no endpoint: nothing to export, so nothing to instrument.
  const token = env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const endpoint = env.POSTHOG_OTLP_ENDPOINT
  if (token && endpoint) {
    initObservability(service, version, { token, endpoint })
  }
}

export { captureException }

/** Sends what is buffered and stops the reporters. Awaited before the process
 * ends. */
export async function flushObservability(): Promise<void> {
  await Promise.allSettled([shutdownObservability(), flushErrorCapture()])
}
