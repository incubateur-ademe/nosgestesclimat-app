import { createAssessActions } from '@nosgestesclimat/core/features/actions/services/assess-actions.service'
import { createComputePollStats } from '@nosgestesclimat/core/features/polls/stats/legacy/compute-poll-stats'
import { createProcessNextPendingPollStats } from '@nosgestesclimat/core/features/polls/stats/services/process-next-pending-poll-stats'
import {
  createGetEngineForModel,
  createWarmUpHotEngines,
} from '@nosgestesclimat/core/features/simulation-computation/services/engine-registry.service'
import { createProcessNextPendingComputation } from '@nosgestesclimat/core/features/simulation-computation/services/process-next-pending-computation.service'
import type { DomainError } from '@nosgestesclimat/core/lib/errors'
import { currentMemoryMB } from '@nosgestesclimat/core/lib/memory'
import type { Result } from '@nosgestesclimat/core/lib/result'
import logger from '../src/logger.ts'

const POLL_INTERVAL_MS = 2000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
const computePollStats = createComputePollStats({ logger })
const processNextPendingPollStats = createProcessNextPendingPollStats({
  computePollStats,
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

async function loop(
  name: string,
  processNext: () => Promise<Result<boolean, DomainError>>
) {
  while (running) {
    try {
      const result = await processNext()
      if (result.success && result.data) {
        logger.info(`[worker] ${name} processed`, currentMemoryMB())
        continue
      }
      if (!result.success) {
        logger.error(`[worker] ${name} failed`, { error: result.error })
      }
    } catch (error) {
      logger.error(`[worker] ${name} failed`, { error })
    }
    await sleep(POLL_INTERVAL_MS)
  }
}

async function main() {
  logger.info('[worker] Starting', currentMemoryMB())

  await warmUpHotEngines()

  await Promise.all([
    loop('Simulation computation', () =>
      processNextPendingComputation(getEngineForModel)
    ),
    loop('Poll stats computation', processNextPendingPollStats),
  ])

  logger.info('[worker] Exiting')
}

main()
