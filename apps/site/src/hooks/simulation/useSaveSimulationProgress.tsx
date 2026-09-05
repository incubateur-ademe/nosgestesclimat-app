'use client'

import type { Simulation } from '@/helpers/server/model/simulations'
import { useCurrentSimulation, useFormState } from '@/publicodes-state'
import { captureException, setExtra } from '@sentry/nextjs'
import type { PropsWithChildren } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSaveSimulation } from './useSaveSimulation'

const SaveSimulationProgressContext = createContext<{
  requestSaveSimulationProgress: () => void
}>({ requestSaveSimulationProgress: () => {} })

/**
 * Everything a progress save writes, minus `progression` and `computedResults`
 * which are derived from it. Compared by content and not by reference: revisiting
 * a skipped question folds it again, and `useUpdateCurrentSimulation` rebuilds
 * `extendedSituation` into a fresh object with identical content.
 */
function getSignature({
  situation,
  extendedSituation,
  foldedSteps,
}: Pick<Simulation, 'situation' | 'extendedSituation' | 'foldedSteps'>) {
  return JSON.stringify({ situation, extendedSituation, foldedSteps })
}

/**
 * Persists the simulation being answered, on demand. Mounted inside the form so
 * that the "Suivant" button and "Je ne sais pas répondre" share a single view of
 * what was last written, and so that navigating back and forth without touching
 * an answer costs nothing.
 */
export function SaveSimulationProgressProvider({
  children,
}: PropsWithChildren) {
  const currentSimulation = useCurrentSimulation()
  // Read from the form provider, not from the simulation: `simulation.progression`
  // is written by an effect in an ancestor, which React runs *after* this one, so
  // it lags a commit behind on every folding path.
  const { progression } = useFormState()
  const { saveSimulation } = useSaveSimulation()

  // Armed by a request, consumed by the effect below: without it the effect would
  // save on any state change, which is the auto-save we are removing.
  const isSaveRequestedRef = useRef(false)
  // Bumped alongside so a render — and therefore the effect — is guaranteed even
  // when the click changed nothing else.
  const [saveRequestCount, setSaveRequestCount] = useState(0)

  // Seeded with the server-loaded simulation: reloading mid-test and moving on
  // without answering must not write either.
  const lastSavedSignatureRef = useRef<string | null>(null)
  if (lastSavedSignatureRef.current === null) {
    lastSavedSignatureRef.current = getSignature(currentSimulation)
  }

  // Server actions called from a handler are unqueued POSTs: two quick clicks can
  // land out of order and the older snapshot would win the row.
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve())

  const requestSaveSimulationProgress = useCallback(() => {
    isSaveRequestedRef.current = true
    setSaveRequestCount((count) => count + 1)
  }, [])

  useEffect(() => {
    if (!isSaveRequestedRef.current) return
    isSaveRequestedRef.current = false

    // Completing belongs to `endTestAction`. Writing `progression: 1` here would
    // mark the simulation completed server-side, making every later save fail
    // with a SimulationCompletedError and bouncing a reload to /fin.
    if (progression >= 1) return

    const { situation, extendedSituation, foldedSteps } = currentSimulation

    const signature = getSignature({
      situation,
      extendedSituation,
      foldedSteps,
    })
    if (signature === lastSavedSignatureRef.current) return
    lastSavedSignatureRef.current = signature

    saveQueueRef.current = saveQueueRef.current.then(async () => {
      try {
        await saveSimulation({
          simulation: { ...currentSimulation, progression },
        })
      } catch (error) {
        setExtra('simulationId', currentSimulation.id)
        setExtra('situation', JSON.stringify(currentSimulation.situation))
        captureException(error)
      }
    })
  }, [saveRequestCount, currentSimulation, progression, saveSimulation])

  const value = useMemo(
    () => ({ requestSaveSimulationProgress }),
    [requestSaveSimulationProgress]
  )

  return (
    <SaveSimulationProgressContext.Provider value={value}>
      {children}
    </SaveSimulationProgressContext.Provider>
  )
}

/**
 * Asks for the answers given so far to be persisted. Only saves when the data
 * actually changed since the last write.
 */
export const useSaveSimulationProgress = () =>
  useContext(SaveSimulationProgressContext)
