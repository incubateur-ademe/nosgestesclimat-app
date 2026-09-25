import { parseCooldownTiers } from '@nosgestesclimat/core/features/polls/stats/helpers/cooldown-policy'
import * as v from 'valibot'

import { publicEnv } from './env.public'

/**
 * Server environment configuration, validated once at import time: a missing
 * or empty variable fails loudly here rather than surfacing as an obscure
 * runtime error (an unauthenticated Brevo call, a `undefined/...` URL, ...).
 *
 * Server-only: it reads secrets, so it must never be imported from a client
 * component. Use `env.public.ts` for client-side access.
 */

const NonEmptyStringSchema = v.pipe(v.string(), v.nonEmpty())

const ServerEnvSchema = v.object({
  BREVO_API_KEY: NonEmptyStringSchema,
  BREVO_URL: v.pipe(NonEmptyStringSchema, v.url()),
  POLL_STATS_COOLDOWN_TIERS: v.pipe(
    v.optional(v.string(), ''),
    v.transform((tiers: string) => parseCooldownTiers(tiers))
  ),
})

// The whole `process.env` is passed to the schema and the plain `v.object`
// drops every key it does not know from its output, so unrelated host
// variables (NVM_INC, CI, ...) neither fail validation nor leak into `env`.
const parsed = v.safeParse(ServerEnvSchema, process.env)

if (!parsed.success) {
  const issues = parsed.issues
    .map((issue) => {
      const path = v.getDotPath(issue)

      return `- ${path ?? 'unknown'}: ${issue.message}`
    })
    .join('\n')

  throw new Error(`Invalid environment variables:\n${issues}`)
}

export const env = { ...publicEnv, ...parsed.output }
