import { LOG_LEVELS } from '@nosgestesclimat/core/features/logger/index'
import * as v from 'valibot'

import { mayBeUnset, NonEmptyStringSchema, parseEnv } from './shared'

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
