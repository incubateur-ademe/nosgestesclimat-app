'use client'

import { useState, type PropsWithChildren } from 'react'

import useCurrentSimulation from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import type { Situation } from '@/publicodes-state/types'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import { EngineContext } from './context'
import { useCategories } from './hooks/useCategories'
import { useEngine } from './hooks/useEngine'
import { useAddToEngineSituation } from './hooks/useEngineSituation'
import { useRules } from './hooks/useRules'

interface Props {
  rules: Partial<NGCRules>
  root?: DottedName
  shouldAlwaysDisplayChildren?: boolean
  initialSituation?: Situation
}
export default function EngineProvider({
  rules,
  root = 'bilan',
  children,
  initialSituation,
}: PropsWithChildren<Props>) {
  const { situation: initialSituationFromUser } = useCurrentSimulation()
  const [situation] = useState(initialSituation ?? initialSituationFromUser)

  const { engine, pristineEngine, safeEvaluate, safeGetRule } = useEngine(
    rules,
    situation
  )

  const {
    parsedRules,
    everyRules,
    everyInactiveRules,
    everyQuestions,
    everyNotifications,
    everyUiCategories,
    everyMosaicChildrenWithParent,
    rawMissingVariables,
  } = useRules({ engine: pristineEngine, root })

  const { categories, subcategories } = useCategories({
    parsedRules,
    everyRules,
    root,
    safeGetRule,
  })

  const { addToEngineSituation } = useAddToEngineSituation({
    engine,
    safeEvaluate,
    rawMissingVariables,
  })

  return (
    <EngineContext.Provider
      value={{
        rules,
        engine,
        pristineEngine,
        safeEvaluate,
        safeGetRule,
        parsedRules,
        everyRules,
        everyInactiveRules,
        everyQuestions,
        everyNotifications,
        everyUiCategories,
        everyMosaicChildrenWithParent,
        rawMissingVariables,
        categories,
        subcategories,
        addToEngineSituation,
      }}>
      {children}
    </EngineContext.Provider>
  )
}
