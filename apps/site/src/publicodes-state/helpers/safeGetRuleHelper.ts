import logger from '@/logger/logger.browser'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import type { Engine } from '../types'

export const safeGetRuleHelper = (
  ruleName: DottedName,
  engineUsed: Engine
): NGCRuleNode | null => {
  let rule = null
  try {
    rule = engineUsed.getRule(ruleName)
  } catch (error) {
    // A rule that does not resolve is a bug, so the level captures it. The name
    // is model vocabulary, not an answer: it can name the failure.
    logger.error(toError(error), {
      scope: 'site.engine.safeGetRule',
      rule: ruleName,
    })
  }
  return rule
}
