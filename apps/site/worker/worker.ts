/* eslint-disable no-console */

// Bypass --experimental-strip-types node_modules/.d.ts limitation by importing the runtime JSON directly
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }

import { processNextPendingComputation } from '@nosgestesclimat/core/features/publicodes-computation/services/coordination.service'
import Engine from 'publicodes'

const POLL_INTERVAL_MS = 2000

const engine = new Engine(rules, {
  strict: {
    situation: false,
    noOrphanRule: false,
  },
  logger: {
    log: () => {
      // nothing
    },
    warn: () => {
      // nothing
    },
    error: console.error,
  },
})

console.log('[worker] Engine ready')

let running = true
process.on('SIGTERM', () => {
  console.log('[worker] SIGTERM received, shutting down after current job')
  running = false
})
process.on('SIGINT', () => {
  console.log('[worker] SIGINT received, shutting down after current job')
  running = false
})

async function main() {
  while (running) {
    try {
      const processed = await processNextPendingComputation(engine)
      if (processed) {
        console.log('[worker] Job processed')
        // Drain the queue without delay
        continue
      }
    } catch (error) {
      console.error('[worker] Job failed:', error)
    }
    if (running) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
  }
  console.log('[worker] Exiting')
}

main()
