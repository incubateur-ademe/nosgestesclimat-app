import * as v from 'valibot'

import { InvalidPayloadError } from './errors.ts'
import { failure, success, type Result } from './result.ts'

export function validatePayload<T extends v.GenericSchema>(
  schema: T,
  payload: unknown
): Result<v.InferOutput<T>, InvalidPayloadError> {
  const parsed = v.safeParse(schema, payload)
  if (!parsed.success) {
    return failure(new InvalidPayloadError())
  }
  return success(parsed.output)
}
