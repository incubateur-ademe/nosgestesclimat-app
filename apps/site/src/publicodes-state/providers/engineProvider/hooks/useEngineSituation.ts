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
  engine: Engine | undefined
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
  const addToEngineSituation = useCallback(
    (situationToAdd: Situation): Situation => {
      if (!engine) {
        return {} as Situation
      }
      // Merge over the engine's live situation, not the render snapshot: two
      // writes in one tick would otherwise start from the same stale base and
      // the second would erase the first. An `undefined` value removes the rule
      // from the situation — publicodes rejects it as a value.
      const merged = { ...engine.getSituation(), ...situationToAdd }
      engine.setSituation(
        Object.fromEntries(
          Object.entries(merged).filter(([, value]) => value !== undefined)
        )
      )

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
    [engine, rawMissingVariables, safeEvaluate]
  )

  return { addToEngineSituation }
}
