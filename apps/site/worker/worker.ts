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
import { SpanStatusCode } from '@opentelemetry/api'
import { createLogger } from '../src/logger.ts'
import { appTracer } from '../src/observability/setup.ts'
import { captureException, flushObservability } from './observability.ts'

const logger = createLogger({ service: 'worker', onCapture: captureException })

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
 * state: it dies instead, and the orchestrator restarts a sane one.
 */
async function crash(error: Error) {
  logger.fatal(error)
  await flushObservability()
  process.exit(1)
}

process.on('uncaughtException', (error) => void crash(error))
process.on('unhandledRejection', (reason) => void crash(toError(reason)))

async function loop(
  name: string,
  processNext: () => Promise<Result<boolean, DomainError>>
) {
  const jobLogger = logger.child({ job: name })

  while (running) {
    // The span covers the whole iteration: its logs share the trace ids, and a
    // failure marks the iteration as failed.
    await appTracer().startActiveSpan(`worker:${name}`, async (span) => {
      try {
        const result = await processNext()

        if (!result.success) {
          // A job that cannot be processed is not retried: it needs a human.
          jobLogger.error(result.error)
          return
        }

        if (result.data) {
          jobLogger.info('job processed', { ...memoryAttributes() })
        }
      } catch (error) {
        span.recordException(toError(error))
        span.setStatus({ code: SpanStatusCode.ERROR })
        jobLogger.error(toError(error))
      } finally {
        span.end()
      }
    })

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
    loop('Simulation computation', () =>
      processNextPendingComputation(getEngineForModel)
    ),
    loop('Poll stats computation', processNextPendingPollStats),
  ])

  logger.info('worker exiting')
  await flushObservability()
}

void main()
