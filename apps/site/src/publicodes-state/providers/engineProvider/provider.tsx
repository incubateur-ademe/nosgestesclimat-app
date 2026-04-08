/*
  We disable the rule of hooks here because we need to ensure
  that the provider is only rendered on the client before callings engine initialisation hook.
  Indeed the cost of initializing the engine is too high to be done on the server.
*/
/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import { useState, type PropsWithChildren } from 'react'

import useCurrentSimulation from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import { isServerSide } from '@/utils/nextjs/isServerSide'
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
}
export default function EngineProvider({
  rules,
  root = 'bilan',
  children,
}: PropsWithChildren<Props>) {
  if (isServerSide()) {
    return children
  }
  const { situation } = useCurrentSimulation()
  const [initialSituation] = useState(situation)
  const { engine, pristineEngine, safeEvaluate, safeGetRule } = useEngine(
    rules,
    initialSituation
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
