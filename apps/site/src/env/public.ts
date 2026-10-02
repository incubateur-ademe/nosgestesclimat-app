import { LOG_LEVELS } from '@nosgestesclimat/core/features/logger/index'
import * as v from 'valibot'

import { mayBeUnset, NonEmptyStringSchema, parseEnv } from './shared'

/**
 * Public environment configuration, validated once at import time.
 *
 * Safe to import from client components: it only contains `NEXT_PUBLIC_*`
 * variables, which the bundler inlines — but only when they are referenced as
 * the static `process.env.X` expressions below. A dynamic lookup, or the whole
 * `process.env`, is not substituted: in the browser `process.env` is an empty
 * shim.
 */

const PublicEnvSchema = v.object({
  NEXT_PUBLIC_SITE_URL: v.pipe(NonEmptyStringSchema, v.url()),
  NEXT_PUBLIC_LOG_LEVEL: mayBeUnset(v.picklist(LOG_LEVELS)),
  // Inlined by `next.config.ts` from `SENTRY_DSN`, which the server contract
  // validates once: same project, one source.
  NEXT_PUBLIC_SENTRY_DSN: mayBeUnset(NonEmptyStringSchema),
})

export const publicEnv = parseEnv(PublicEnvSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
})
