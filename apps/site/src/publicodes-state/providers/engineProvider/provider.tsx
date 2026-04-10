'use client'

import type { PropsWithChildren } from 'react'

import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import { EngineContext } from './context'
import { useCategories } from './hooks/useCategories'
import { useEngine } from './hooks/useEngine'
import { useEngineSituation } from './hooks/useEngineSituation'
import { useInitializeSimulationWithEngine } from './hooks/useInitializeSimulationWithEngine'
import { useRules } from './hooks/useRules'

interface Props {
  rules?: Partial<NGCRules>
  root?: DottedName
  shouldAlwaysDisplayChildren?: boolean
}
export default function EngineProvider({
  rules,
  root = 'bilan',
  children,
}: PropsWithChildren<Props>) {
  const { engine, pristineEngine, safeEvaluate, safeGetRule } = useEngine(rules)

  const {
    parsedRules,
    everyRules,
    everyInactiveRules,
    everyQuestions,
    everyNotifications,
    everyUiCategories,
    everyMosaicChildrenWithParent,
    rawMissingVariables,
  } = useRules({ engine: pristineEngine ?? undefined, root })

  const { categories, subcategories } = useCategories({
    parsedRules,
    everyRules,
    root,
    safeGetRule: safeGetRule ?? undefined,
  })

  const { isEngineInitialized, addToEngineSituation } = useEngineSituation({
    engine,
    safeEvaluate,
    rawMissingVariables,
  })

  const { isInitialized } = useInitializeSimulationWithEngine({
    categories,
    subcategories,
    everyQuestions,
    everyMosaicChildrenWithParent,
    isEngineInitialized,
    safeGetRule,
    safeEvaluate,
  })

  if (!rules || !engine || !isInitialized) return children

  return (
    <EngineContext.Provider
      value={{
        rules,
        engine,
        pristineEngine,
        safeEvaluate,
        safeGetRule: safeGetRule ?? undefined,
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
        isInitialized,
      }}>
      {children}
    </EngineContext.Provider>
  )
}
