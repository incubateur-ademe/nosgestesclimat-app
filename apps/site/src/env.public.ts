import * as v from 'valibot'

/**
 * Public environment configuration, validated once at import time.
 *
 * Safe to import from client components: it only contains `NEXT_PUBLIC_*`
 * variables, which the bundler inlines — but only when they are referenced as
 * the static `process.env.X` expressions below. A dynamic lookup, or the whole
 * `process.env`, is not substituted: in the browser `process.env` is an empty
 * shim.
 */

const NonEmptyStringSchema = v.pipe(v.string(), v.nonEmpty())

const PublicEnvSchema = v.object({
  NEXT_PUBLIC_SITE_URL: v.pipe(NonEmptyStringSchema, v.url()),
})

const parsed = v.safeParse(PublicEnvSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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

export const publicEnv = parsed.output
