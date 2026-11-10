import type { Result } from '../../../lib/result.ts'
import type { UnexpectedNodeValueError } from '../errors.ts'

/**
 * How the engine evaluated a rule: a value to store, mapped to `Applicability`,
 * or one that cannot be stored.
 */
export type EngineEvaluation<Applicability> = Result<
  Applicability,
  UnexpectedNodeValueError
>
