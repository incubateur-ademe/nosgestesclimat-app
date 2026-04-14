import { useCurrentSimulation } from '@/publicodes-state'
import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import type {
  Engine,
  MissingVariables,
  SafeEvaluate,
  Situation,
} from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useEffect, useState } from 'react'

interface Props {
  engine: Engine | undefined
  safeEvaluate: SafeEvaluate
  rawMissingVariables: MissingVariables
}
/**
 * Update the engine situation and the simulation situation
 */
export function useEngineSituation({
  engine,
  safeEvaluate,
  rawMissingVariables,
}: Props) {
  const { situation } = useCurrentSimulation()

  const [isEngineInitialized, setIsEngineInitialized] = useState(false)

  const addToEngineSituation = useCallback(
    (situationToAdd: Situation): Situation => {
      if (!engine) return situation

      engine.setSituation({ ...situation, ...situationToAdd })

      // The current engine situation might have been filtered with Publicodes filtering logic.
      const safeSituation = engine.getSituation()

      const cleanSituation = Object.fromEntries(
        Object.entries(safeSituation).filter(([dottedName]) => {
          return checkIfDottedNameShouldNotBeIgnored({
            dottedName: dottedName as DottedName,
            safeEvaluate,
            rawMissingVariables,
          })
        })
      )

      engine.setSituation(cleanSituation)

      return cleanSituation
    },
    [engine, rawMissingVariables, safeEvaluate, situation]
  )

  useEffect(() => {
    if (isEngineInitialized || !engine) return

    engine.setSituation(situation)
    setIsEngineInitialized(true)
  }, [engine, situation, isEngineInitialized])

  return { isEngineInitialized, addToEngineSituation }
}
