import * as v from 'valibot'

/**
 * Public environment configuration, validated once at import time.
 *
 * Safe to import from client components: it only contains `NEXT_PUBLIC_*`
 * variables, which Next inlines at build time. The full `process.env.NEXT_PUBLIC_X`
 * literals below are required - a dynamic lookup would not be substituted.
 */

const NonEmptyStringSchema = v.pipe(v.string(), v.nonEmpty())

const PublicEnvSchema = v.strictObject({
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
