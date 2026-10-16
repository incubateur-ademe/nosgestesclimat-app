import { LOG_VERBOSITIES } from '@nosgestesclimat/core/features/logger/index'
import * as v from 'valibot'

import {
  NonEmptyStringSchema,
  mayBeUnset,
  parseEnv,
  requiredInProduction,
} from './shared.ts'

export const PublicEnvSchema = v.object({
  NEXT_PUBLIC_SITE_URL: v.pipe(NonEmptyStringSchema, v.url()),
  NEXT_PUBLIC_LOG_VERBOSITY: mayBeUnset(v.picklist(LOG_VERBOSITIES)),
  // Public by design, like the token below: it ships in the browser bundle, so
  // one name serves the browser, the server and the worker.
  NEXT_PUBLIC_SENTRY_DSN: requiredInProduction(
    v.pipe(NonEmptyStringSchema, v.url())
  ),
  // Inlined by `next.config.ts` from the build-time `SOURCE_VERSION`: the
  // browser and the server read the same literal, and neither reads the
  // environment, where it never exists.
  NEXT_PUBLIC_APP_VERSION: mayBeUnset(NonEmptyStringSchema),
  // The project token, the one the browser also inlines under this name: logs,
  // traces, exceptions and the SDK's events all come from one project.
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: requiredInProduction(NonEmptyStringSchema),
  // Where the server-side client sends. The tracking module reads it raw,
  // because the worker loads that module and has no contract of its own.
  NEXT_PUBLIC_POSTHOG_HOST: requiredInProduction(
    v.pipe(NonEmptyStringSchema, v.url())
  ),
})

/** Reads the public environment. */
export const readPublicEnv = () =>
  parseEnv(PublicEnvSchema, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_LOG_VERBOSITY: process.env.NEXT_PUBLIC_LOG_VERBOSITY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })
