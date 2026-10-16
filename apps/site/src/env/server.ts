import { parseCooldownTiers } from '@nosgestesclimat/core/features/polls/stats/helpers/cooldown-policy'
import * as v from 'valibot'

import { publicEnv } from './public.ts'
import {
  mayBeUnset,
  NonEmptyStringSchema,
  parseEnv,
  requiredInProduction,
} from './shared.ts'

const ServerEnvSchema = v.object({
  BREVO_API_KEY: NonEmptyStringSchema,
  BREVO_URL: v.pipe(NonEmptyStringSchema, v.url()),
  REDIS_URL: v.pipe(NonEmptyStringSchema, v.url()),
  POLL_STATS_COOLDOWN_TIERS: v.pipe(
    v.optional(v.string(), ''),
    v.transform((tiers: string) => parseCooldownTiers(tiers))
  ),
  // Observability. A tuning knob may stay unset — the logger has its own
  // default (`pretty = false`; the verbosity is `NEXT_PUBLIC_LOG_VERBOSITY`, one
  // variable for every runtime, validated in `public.ts`).
  LOG_PRETTY: mayBeUnset(v.pipe(v.string(), v.parseBoolean())),
  // Where the OTLP exporters post. Required in production: the region is a
  // deployment choice, and its absence would cost the telemetry without saying
  // so.
  POSTHOG_OTLP_ENDPOINT: requiredInProduction(
    v.pipe(NonEmptyStringSchema, v.url())
  ),
  // The source-map upload runs in this very build, and needs a personal key
  // (not the project token) plus the project id: a build without them ships
  // stack traces nobody can read.
  POSTHOG_PERSONAL_API_KEY: requiredInProduction(NonEmptyStringSchema),
  POSTHOG_PROJECT_ID: requiredInProduction(NonEmptyStringSchema),
})

// The whole `process.env` is passed to the schema and the plain `v.object`
// drops every key it does not know from its output, so unrelated host
// variables (NVM_INC, CI, ...) neither fail validation nor leak into `env`.
export const env = { ...publicEnv, ...parseEnv(ServerEnvSchema, process.env) }
