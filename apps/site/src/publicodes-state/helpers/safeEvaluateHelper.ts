import logger from '@/logger/logger.browser'
import type { Engine } from '@/publicodes-state/types'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import type { EvaluatedNode, PublicodesExpression } from 'publicodes'

export const safeEvaluateHelper = (
  expr: PublicodesExpression,
  engineUsed: Engine
): EvaluatedNode | null => {
  let evaluation: EvaluatedNode | null = null
  try {
    evaluation = engineUsed.evaluate(expr)
  } catch (error) {
    // A throw here is a bug, not a graceful fallback: `error` level, and the
    // capture follows it. The expression stays out of the line — it can hold
    // answers.
    logger.error(toError(error), { scope: 'site.engine.safeEvaluate' })
  }
  return evaluation
}
