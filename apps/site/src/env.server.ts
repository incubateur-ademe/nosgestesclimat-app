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

const ServerEnvSchema = v.strictObject({
  BREVO_API_KEY: NonEmptyStringSchema,
  BREVO_URL: v.pipe(NonEmptyStringSchema, v.url()),
})

const parsed = v.safeParse(ServerEnvSchema, {
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_URL: process.env.BREVO_URL,
})

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
