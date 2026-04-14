import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { captureException } from '@sentry/nextjs'
import type { Engine } from '../types'

export const safeGetRuleHelper = (
  ruleName: DottedName,
  engineUsed: Engine
): NGCRuleNode | null => {
  let rule = null
  try {
    rule = engineUsed.getRule(ruleName)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(error)
    captureException(error)
  }
  return rule
}
