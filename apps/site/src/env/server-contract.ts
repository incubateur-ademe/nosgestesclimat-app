import { parseCooldownTiers } from '@nosgestesclimat/core/features/polls/stats/helpers/cooldown-policy'
import * as v from 'valibot'

import { readPublicEnv } from './public-contract.ts'
import {
  NonEmptyStringSchema,
  mayBeUnset,
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

/**
 * Reads the environment a server-side face of the site gets: the public
 * contract and this one. A function, so that a process which is not the web
 * reads it once it can report what fails.
 */
export const readServerEnv = () => ({
  ...readPublicEnv(),
  // The whole `process.env` goes to the schema: the plain `v.object` drops the
  // keys it does not know, so unrelated host variables (NVM_INC, CI…) neither
  // fail validation nor leak into the result.
  ...parseEnv(ServerEnvSchema, process.env),
})
