'use client'

import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import {
  EMPTY_SITUATION,
  useOptionalSimulation,
} from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useState } from 'react'
import type { CustomQuestion } from './types'

/**
 * The draft a custom question owns (the journeys list), loaded from its store
 * once per question and persisted on every edit. `onCommit` turns the draft
 * into a patch, applied through the single write bridge.
 */
export function useCustomDraft(
  custom: CustomQuestion | undefined,
  question: DottedName | null
) {
  const situation = useOptionalSimulation()?.situation ?? EMPTY_SITUATION
  const { applyPatch } = useFormWriteService()
  const store = custom?.draft

  const load = (forQuestion: DottedName | null) =>
    store && forQuestion
      ? store.load({ question: forQuestion, situation })
      : undefined

  // The draft belongs to the question: reload it when the question changes.
  // React re-renders before painting, so the intermediate value is never shown.
  const [loaded, setLoaded] = useState(() => ({
    question,
    draft: load(question),
  }))
  if (loaded.question !== question) {
    setLoaded({ question, draft: load(question) })
  }

  const onChange = useCallback(
    (next: unknown) => {
      if (!store || !question) return
      setLoaded({ question, draft: next })
      store.persist?.(question, next)
      if (custom.onCommit) {
        applyPatch(custom.onCommit({ draft: next, question }), {
          questionDottedName: question,
        })
      }
    },
    [store, custom, question, applyPatch]
  )

  if (!store) return undefined
  return { value: loaded.draft, onChange }
}
