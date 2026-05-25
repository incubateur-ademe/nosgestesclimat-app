import { useCurrentSimulation } from '@/publicodes-state'
import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import type {
  Engine,
  MissingVariables,
  SafeEvaluate,
  Situation,
} from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback } from 'react'

interface Props {
  engine: Engine
  safeEvaluate: SafeEvaluate
  rawMissingVariables: MissingVariables
}
/**
 * Update the engine situation and the simulation situation
 */
export function useAddToEngineSituation({
  engine,
  safeEvaluate,
  rawMissingVariables,
}: Props) {
  const { situation } = useCurrentSimulation()
  const addToEngineSituation = useCallback(
    (situationToAdd: Situation): Situation => {
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

  return { addToEngineSituation }
}
