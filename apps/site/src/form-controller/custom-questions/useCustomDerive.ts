'use client'

import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import { useEngine } from '@/publicodes-state'
import {
  EMPTY_SITUATION,
  useOptionalSimulation,
} from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useEffect } from 'react'
import type { CustomQuestion, SituationPatch } from './types'

/**
 * What the answers imply for a custom question (the wardrobe detail implies the
 * consumption profile). Only the entries that differ from the situation are
 * written, so the effect settles instead of rewriting its own output.
 */
export function useCustomDerive(
  custom: CustomQuestion | undefined,
  question: DottedName | null
) {
  const situation = useOptionalSimulation()?.situation ?? EMPTY_SITUATION
  const { safeEvaluate, everyMosaicChildrenWithParent } = useEngine()
  const { applyPatch } = useFormWriteService()
  const derive = custom?.derive

  useEffect(() => {
    if (!derive || !question) return

    const patch = derive({
      situation,
      evaluate: safeEvaluate,
      // The record only holds mosaic parents: a scalar reads as no children.
      childrenOf: (dottedName) =>
        (everyMosaicChildrenWithParent[dottedName] as
          | DottedName[]
          | undefined) ?? [],
    })
    if (!patch) return

    const situationValue = (dottedName: DottedName): NodeValue =>
      situation[dottedName] === undefined
        ? undefined
        : safeEvaluate(situation[dottedName])?.nodeValue

    const changed = Object.entries(patch).filter(
      ([dottedName, value]) =>
        situationValue(dottedName as DottedName) !== value
    )
    if (!changed.length) return

    applyPatch(Object.fromEntries(changed) as SituationPatch, {
      questionDottedName: question,
    })
  }, [
    derive,
    question,
    situation,
    safeEvaluate,
    everyMosaicChildrenWithParent,
    applyPatch,
  ])
}
