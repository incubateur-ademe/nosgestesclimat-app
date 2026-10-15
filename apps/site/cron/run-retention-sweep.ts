import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'
import type { LogVerbosity } from '@nosgestesclimat/core/features/logger/index'
import { runRetentionSweep } from '@nosgestesclimat/core/features/users/services/run-retention-sweep.service'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import * as v from 'valibot'
import { NonEmptyStringSchema, parseEnv } from '../src/env/shared.ts'
import { createLogger } from '../src/logger/logger.node.ts'
import { captureException, flushObservability } from './observability.ts'

// This process has no `env/server.ts` either: that file is the site's contract,
// and it requires variables the cron never reads.
const BrevoEnvSchema = v.object({
  BREVO_API_KEY: NonEmptyStringSchema,
  BREVO_URL: v.pipe(NonEmptyStringSchema, v.url()),
})

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

    const brevo = parseEnv(BrevoEnvSchema, process.env)
    const { sendEmail } = createBrevoClient({
      apiKey: brevo.BREVO_API_KEY,
      url: brevo.BREVO_URL,
    })

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
