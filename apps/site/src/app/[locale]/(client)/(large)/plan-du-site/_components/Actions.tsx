'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import getActions from '@/helpers/actions/getActions'
import { useEngine, useTempEngine } from '@/publicodes-state'
import type { Action } from '@/publicodes-state/types'
import { utils } from 'publicodes'

export default function Actions() {
  const { safeEvaluate, rules } = useEngine()
  const { getSpecialRuleObject } = useTempEngine()

  if (!rules) {
    return null
  }

  const actions = getActions({
    rules,
    radical: true,
    safeEvaluate,
    getSpecialRuleObject,
    actionChoices: {},
  })

  if (!actions) {
    return null
  }

  return (
    <>
      <h2 data-testid="plan-actions-title">
        <Trans i18nKey="publicodes.planDuSite.actionsPlus">Les actions</Trans>
      </h2>

      <ul className="m-0 list-none p-0">
        {actions.map((action: Action) => {
          return (
            <li key={action.dottedName}>
              <Link
                href={`${MON_ESPACE_ACTIONS_PATH}/${utils.encodeRuleName(action.dottedName)}`}>
                {action.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
