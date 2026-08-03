import { createAssessActions } from '@nosgestesclimat/core/features/actions/services/assess-actions.service'
import {
  createGetEngineForModel,
  createWarmUpHotEngines,
} from '@nosgestesclimat/core/features/simulation-computation/services/engine-registry.service'
import { createProcessNextPendingComputation } from '@nosgestesclimat/core/features/simulation-computation/services/process-next-pending-computation.service'
import { currentMemoryMB } from '@nosgestesclimat/core/lib/memory'
import logger from '../src/logger.ts'

const POLL_INTERVAL_MS = 2000

const warmUpHotEngines = createWarmUpHotEngines({ logger })
const getEngineForModel = createGetEngineForModel({ logger })
const assessActions = createAssessActions({
  logger,
  // TODO: Setup Sentry in worker
  captureException() {},
})
const processNextPendingComputation = createProcessNextPendingComputation({
  assessActions,
})

let running = true
process.on('SIGTERM', () => {
  logger.info('[worker] SIGTERM received, shutting down after current job')
  running = false
})
process.on('SIGINT', () => {
  logger.info('[worker] SIGINT received, shutting down after current job')
  running = false
})

async function main() {
  logger.info('[worker] Starting', currentMemoryMB())

  await warmUpHotEngines()

  while (running) {
    try {
      const processed = await processNextPendingComputation(getEngineForModel)
      if (processed) {
        // Sampled after the engine cache reset, so heapUsed here is the
        // between-jobs floor rather than the peak reached during the job.
        logger.info('[worker] Job processed', currentMemoryMB())
        // Drain the queue without delay
        continue
      }
    } catch (error) {
      logger.error('[worker] Job failed', { error })
    }
    if (running) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
  }
  logger.info('[worker] Exiting')
}

main()
