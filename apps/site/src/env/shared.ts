import * as v from 'valibot'

import { APP_ENV } from './app-env'

export const NonEmptyStringSchema = v.pipe(v.string(), v.nonEmpty())

/** `.env` writes unset as `KEY=` → `process.env` reports `''`. As the first
 * union branch, a field declares it accepts empty-as-unset.
 * See https://github.com/open-circle/valibot/issues/892 */
const EmptyIsUnsetSchema = v.pipe(
  v.literal(''),
  v.transform(() => undefined)
)

/**
 * A variable the environment may leave out, or write empty: both mean "unset",
 * and the consumer applies its own default.
 */
export const mayBeUnset = <TWrapped extends v.GenericSchema>(
  wrapped: TWrapped
) => v.optional(v.union([EmptyIsUnsetSchema, wrapped]))

/**
 * A variable whose absence costs the telemetry without saying so: required in
 * production, free elsewhere, where nothing is exported anyway.
 */
export const requiredInProduction = <TWrapped extends v.GenericSchema>(
  wrapped: TWrapped
) => (APP_ENV === 'production' ? wrapped : mayBeUnset(wrapped))

/**
 * Validates a contract once, at import time, naming the variable that broke it:
 * failing here rather than somewhere down the line is the whole point.
 */
export const parseEnv = <TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: unknown
): v.InferOutput<TSchema> => {
  const parsed = v.safeParse(schema, input)

  if (!parsed.success) {
    const issues = parsed.issues
      .map((issue) => `- ${v.getDotPath(issue) ?? 'unknown'}: ${issue.message}`)
      .join('\n')

    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  return parsed.output
}
