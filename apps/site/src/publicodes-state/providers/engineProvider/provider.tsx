'use client'

import type { PropsWithChildren } from 'react'

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
  const situationFromUser = useOptionalSimulation()?.situation
  /**
   * The situation the engine is seeded with. Deliberately not frozen at mount:
   * the engine is rebuilt whenever the `rules` prop changes identity, and the
   * server hands over a new (deep-equal) rules object on every route refresh.
   * Seeding it with the answers given so far — rather than with the ones held
   * at mount — keeps a rebuild from silently resetting the user's footprint to
   * the model defaults mid-test.
   */
  const situation = initialSituation ?? situationFromUser ?? EMPTY_SITUATION

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
    everyMosaicChildrenWithParent,
    rawMissingVariables,
  } = useRules({ engine: pristineEngine, root })

  const { categories, subcategories } = useCategories({
    parsedRules,
    everyRules,
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
