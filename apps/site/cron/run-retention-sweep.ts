import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'
import type { LogVerbosity } from '@nosgestesclimat/core/features/logger/index'
import { runRetentionSweep } from '@nosgestesclimat/core/features/users/services/run-retention-sweep.service'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import { createLogger } from '../src/logger/logger.node.ts'
import { captureException, flushObservability } from './observability.ts'

const logger = createLogger({
  service: 'cron',
  verbosity:
    (process.env.NEXT_PUBLIC_LOG_VERBOSITY as LogVerbosity | undefined) ??
    'info',
  pretty: process.env.LOG_PRETTY === 'true',
  onCapture: captureException,
})

const main = async () => {
  try {
    // Dry by default: the notices announce an erasure that does not exist yet
    // (NGC-3981), and a mistake in the activity rule is a mass email. An
    // unknown flag throws rather than run for real.
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: { dry: { type: 'boolean', default: true } },
      allowNegative: true,
    })

    // Read at the root, like the worker reads its own: this process has no
    // `env/server.ts`, and the site's contract requires variables it never
    // reads. Missing ones are fatal rather than a run that sends nothing.
    const apiKey = process.env.BREVO_API_KEY
    const url = process.env.BREVO_URL
    if (!apiKey || !url) {
      throw new Error('BREVO_API_KEY and BREVO_URL are required')
    }

    const { sendEmail } = createBrevoClient({ apiKey, url })

    // The sweep reports its own run: what it selected, what went out, what
    // failed. A failed send is retried on the next run.
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
