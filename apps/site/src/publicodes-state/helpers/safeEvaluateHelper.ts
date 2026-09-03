import type { Engine } from '@/publicodes-state/types'
import { captureErrorForSentryAndPosthog } from '@/utils/analytics/captureErrorForSentryAndPosthog'
import type { EvaluatedNode, PublicodesExpression } from 'publicodes'

export const safeEvaluateHelper = (
  expr: PublicodesExpression,
  engineUsed: Engine
): EvaluatedNode | null => {
  let evaluation: EvaluatedNode | null = null
  try {
    evaluation = engineUsed.evaluate(expr)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(error)
    captureErrorForSentryAndPosthog(error)
  }
  return evaluation
}
