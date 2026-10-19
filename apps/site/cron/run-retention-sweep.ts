import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'
import { runRetentionSweep } from '@nosgestesclimat/core/features/users/services/run-retention-sweep.service'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import { env } from '../src/env/server.ts'
import { createLogger } from '../src/logger/logger.node.ts'
import { captureException, flushObservability } from './observability.ts'

const logger = createLogger({
  service: 'cron',
  verbosity: env.NEXT_PUBLIC_LOG_VERBOSITY,
  pretty: env.LOG_PRETTY,
  onCapture: captureException,
})

const main = async () => {
  try {
    // Dry by default: the notices announce an erasure that does not exist yet
    // (NGC-3981), and a mistake in the activity rule is a mass email.
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: { dry: { type: 'boolean', default: true } },
      allowNegative: true,
    })

    const { sendEmail } = createBrevoClient({
      apiKey: env.BREVO_API_KEY,
      url: env.BREVO_URL,
    })

    await runRetentionSweep({
      session: prisma,
      now: new Date(),
      dryRun: values.dry,
      sendEmail,
      logger,
    })

    await flushObservability()
    process.exit(0)
  } catch (error) {
    logger.fatal(toError(error))
    await flushObservability()
    process.exit(1)
  }
}

void main()
