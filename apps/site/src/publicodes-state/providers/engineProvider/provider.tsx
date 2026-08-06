'use client'

import { useState, type PropsWithChildren } from 'react'

import {
  EMPTY_SITUATION,
  useOptionalSimulation,
} from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
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
  // Mounted on routes where the user may have no simulation yet (documentation,
  // plan du site, actions with no completed test…): fall back to an empty situation.
  const initialSituationFromUser = useOptionalSimulation()?.situation
  const [situation] = useState(initialSituation ?? initialSituationFromUser ?? EMPTY_SITUATION)

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
