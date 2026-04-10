'use client'

import useEngine from '@/publicodes-state/hooks/useEngine/useEngine'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'
interface Props {
  rule: NGCRuleNode | undefined
  type: string | undefined
}

export default function useChoices({ rule, type }: Props) {
  const { safeEvaluate, engine } = useEngine()
  const choices = useMemo<(string | number)[] | null>(() => {
    if (type === 'choices' && engine) {
      const possibilities = engine
        .getPossibilitiesFor(rule?.dottedName as DottedName)
        ?.filter(({ dottedName: possibilityDottedName }) => {
          // This removes all the possibilities that evaluate to `non applicable`
          // We can't use the native publicodes option `filterNotApplicable` from `getPossibilitiesFor` here because we can't enable filterNotApplicablePossibilities engine flag as it raises a "Maximum call stack size exceeded" error difficult to investigate. So we filter manually here.
          return (
            safeEvaluate({
              'est applicable': possibilityDottedName,
            })?.nodeValue === true
          )
        })
        .map(({ nodeValue }) => nodeValue)

      return possibilities ?? []
    }
    return null
  }, [rule, type, engine, safeEvaluate])

  return choices
}
