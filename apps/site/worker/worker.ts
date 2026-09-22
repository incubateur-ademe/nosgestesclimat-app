import { createAssessActions } from '@nosgestesclimat/core/features/actions/services/assess-actions.service'
import { createComputePollStats } from '@nosgestesclimat/core/features/polls/stats/legacy/compute-poll-stats'
import { createProcessNextPendingPollStats } from '@nosgestesclimat/core/features/polls/stats/services/process-next-pending-poll-stats'
import {
  createGetEngineForModel,
  createWarmUpHotEngines,
} from '@nosgestesclimat/core/features/simulation-computation/services/engine-registry.service'
import { createProcessNextPendingComputation } from '@nosgestesclimat/core/features/simulation-computation/services/process-next-pending-computation.service'
import type { DomainError } from '@nosgestesclimat/core/lib/errors'
import { memoryAttributes } from '@nosgestesclimat/core/lib/memory'
import type { Result } from '@nosgestesclimat/core/lib/result'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { createLogger } from '../src/logger.ts'

const logger = createLogger({
  service: 'worker',
  // This process has no Sentry client: captures are dropped here.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onCapture: () => {},
})

const POLL_INTERVAL_MS = 2000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const warmUpHotEngines = createWarmUpHotEngines({ logger })
const getEngineForModel = createGetEngineForModel({ logger })
const assessActions = createAssessActions({ logger })
const processNextPendingComputation = createProcessNextPendingComputation({
  assessActions,
})
const computePollStats = createComputePollStats({ logger })
const processNextPendingPollStats = createProcessNextPendingPollStats({
  computePollStats,
})

let running = true
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down after current job')
  running = false
})
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down after current job')
  running = false
})

async function loop(
  name: string,
  processNext: () => Promise<Result<boolean, DomainError>>
) {
  const jobLogger = logger.child({ job: name })

  while (running) {
    try {
      const result = await processNext()
      if (result.success && result.data) {
        jobLogger.info('job processed', { ...memoryAttributes() })
        continue
      }
      if (!result.success) {
        jobLogger.error(result.error)
      }
    } catch (error) {
      jobLogger.error(toError(error))
    }
    await sleep(POLL_INTERVAL_MS)
  }
}

async function main() {
  logger.info('worker starting', { ...memoryAttributes() })

  await warmUpHotEngines()

  await Promise.all([
    loop('Simulation computation', () =>
      processNextPendingComputation(getEngineForModel)
    ),
    loop('Poll stats computation', processNextPendingPollStats),
  ])

  logger.info('worker exiting')
}

main()
