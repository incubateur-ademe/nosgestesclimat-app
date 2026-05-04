'use client'

import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import type { Situation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback } from 'react'

/**
 * A hook that provides a function to remove a list of dotted names from the
 * current simulation's situation and sync the engine accordingly.
 *
 * This is used when the user wants to "reset" a question to its model default
 * (e.g. clicking "I don't know" or unchecking the "aucun" option in a mosaic).
 */
export function useClearFromSituation() {
  const { situation, updateCurrentSimulation } = useCurrentSimulation()
  const { engine } = useEngine()

  const clearFromSituation = useCallback(
    (dottedNames: DottedName[]) => {
      // 1. Remove the dotted names from the situation object
      const cleanedSituation = { ...situation }
      dottedNames.forEach((name) => {
        delete cleanedSituation[name]
      })

      // 2. Sync the engine so it recomputes defaults immediately
      engine?.setSituation(cleanedSituation as Situation)

      // 3. Persist the cleaned situation
      updateCurrentSimulation({
        situation: cleanedSituation as Situation,
      })
    },
    [situation, engine, updateCurrentSimulation]
  )

  return { clearFromSituation }
}
