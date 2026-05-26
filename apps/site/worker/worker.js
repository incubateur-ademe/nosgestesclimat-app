/* eslint-disable no-console */

import Engine from 'publicodes'
import rules from '@incubateur-ademe/nosgestesclimat'
// eslint-disable-next-line import/no-unresolved
import { processNextPendingComputation } from '@nosgestesclimat/core/features/publicodes-computation/services/coordination.service'

const POLL_INTERVAL_MS = 2000

const engine = new Engine(rules, {
  strict: {
    situation: false,
    noOrphanRule: false,
  },
  logger: {
    log: () => {},
    warn: () => {},
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
      const engineCopy = engine.shallowCopy()
      const processed = await processNextPendingComputation(engineCopy)
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
