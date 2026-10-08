import { LOG_LEVELS } from '@nosgestesclimat/core/features/logger/index'
import { parseCooldownTiers } from '@nosgestesclimat/core/features/polls/stats/helpers/cooldown-policy'
import * as v from 'valibot'

import { APP_ENV } from './app-env'
import { publicEnv } from './public'
import { mayBeUnset, NonEmptyStringSchema, parseEnv } from './shared'

/**
 * The variables whose absence costs the telemetry without saying so: required
 * in production, free elsewhere, where nothing is exported anyway.
 */
const requiredInProduction = <TWrapped extends v.GenericSchema>(
  wrapped: TWrapped
) => (APP_ENV === 'production' ? wrapped : mayBeUnset(wrapped))

const ServerEnvSchema = v.object({
  BREVO_API_KEY: NonEmptyStringSchema,
  BREVO_URL: v.pipe(NonEmptyStringSchema, v.url()),
  POLL_STATS_COOLDOWN_TIERS: v.pipe(
    v.optional(v.string(), ''),
    v.transform((tiers: string) => parseCooldownTiers(tiers))
  ),
  // Observability. A tuning knob may stay unset — the logger has its own
  // default (`level = 'info'`, `pretty = false`).
  LOG_LEVEL: mayBeUnset(v.picklist(LOG_LEVELS)),
  LOG_PRETTY: mayBeUnset(v.pipe(v.string(), v.parseBoolean())),
  // Where the OTLP exporters post. Required in production: the region is a
  // deployment choice, and its absence would cost the telemetry without saying
  // so.
  POSTHOG_OTLP_ENDPOINT: requiredInProduction(
    v.pipe(NonEmptyStringSchema, v.url())
  ),
  // The project token, the one the browser also inlines under this name: logs,
  // traces, exceptions and the SDK's events all come from one project.
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: requiredInProduction(NonEmptyStringSchema),
  // Where the server-side client sends. The tracking module reads it raw,
  // because the worker loads that module and has no contract of its own.
  NEXT_PUBLIC_POSTHOG_HOST: requiredInProduction(
    v.pipe(NonEmptyStringSchema, v.url())
  ),
  // The source-map upload runs in this very build, and needs a personal key
  // (not the project token) plus the project id: a build without them ships
  // stack traces nobody can read.
  POSTHOG_PERSONAL_API_KEY: requiredInProduction(NonEmptyStringSchema),
  POSTHOG_PROJECT_ID: requiredInProduction(NonEmptyStringSchema),
  SOURCE_VERSION: requiredInProduction(NonEmptyStringSchema),
  SENTRY_DSN: requiredInProduction(v.pipe(NonEmptyStringSchema, v.url())),
})

// The whole `process.env` is passed to the schema and the plain `v.object`
// drops every key it does not know from its output, so unrelated host
// variables (NVM_INC, CI, ...) neither fail validation nor leak into `env`.
export const env = { ...publicEnv, ...parseEnv(ServerEnvSchema, process.env) }
