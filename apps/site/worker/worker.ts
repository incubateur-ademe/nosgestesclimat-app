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
import { env } from '../src/env/server.ts'
import { createLogger } from '../src/logger/logger.node.ts'
import { captureException, flushObservability } from './observability.ts'

const logger = createLogger({
  service: 'worker',
  verbosity: env.NEXT_PUBLIC_LOG_VERBOSITY ?? 'info',
  pretty: env.LOG_PRETTY ?? false,
  onCapture: captureException,
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

/**
 * A process that survived an unknown failure keeps running from an unknown
 * state: it dies instead, and the orchestrator restarts a sane one. An error
 * escaping the process is `wireProcessObservability`'s business.
 */
async function crash(error: Error) {
  logger.fatal(error)
  await flushObservability()
  process.exit(1)
}

async function loop(
  name: string,
  processNext: () => Promise<Result<boolean, DomainError>>
) {
  const jobLogger = logger.child({ job: name })

  // The span covers the whole iteration: its lines share the trace ids, and a
  // failure marks the iteration as failed. Either way the loop keeps running: a
  // job that cannot be processed is not retried in place, it needs a human.
  const iterate = jobLogger.withSpan(
    `site.worker.${name}`,
    async ({ logger }) => {
      const result = await processNext()

      if (!result.success) {
        logger.error(result.error)
        return
      }

      if (result.data) {
        logger.info('job processed', { ...memoryAttributes() })
      }
    }
  )

  while (running) {
    try {
      await iterate()
    } catch (error) {
      // The span is already marked as failed by `withSpan`.
      jobLogger.error(toError(error))
    }

    await sleep(POLL_INTERVAL_MS)
  }
}

async function main() {
  logger.info('worker starting', { ...memoryAttributes() })

  try {
    await warmUpHotEngines()
  } catch (error) {
    await crash(toError(error))
  }

  await Promise.all([
    loop('simulationComputation', () =>
      processNextPendingComputation(getEngineForModel)
    ),
    loop('pollStatsComputation', processNextPendingPollStats),
  ])

  logger.info('worker exiting')
  await flushObservability()
}

void main()
