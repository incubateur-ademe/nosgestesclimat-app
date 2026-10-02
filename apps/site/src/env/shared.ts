import * as v from 'valibot'

/**
 * What both environment contracts are built from: the shape of a variable, the
 * two policies a variable can follow, and the one place a validation failure is
 * rendered.
 */

export const NonEmptyStringSchema = v.pipe(v.string(), v.nonEmpty())

/**
 * A `.env` file writes an unset variable as `KEY=`, which `process.env` reports
 * as `''`. As the first branch of a union, a field declares that it accepts it —
 * the pattern the maintainers give on
 * https://github.com/open-circle/valibot/issues/892.
 */
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
