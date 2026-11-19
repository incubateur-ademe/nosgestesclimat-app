'use client'

import { DEFAULT_PLAFOND, DEFAULT_PLANCHER } from '@/constants/model/bounds'
import { readMosaicValues } from '@/form-controller/drafts/mosaic'
import type { DraftStore } from '@/form-controller/drafts/useDraftStore'
import { useEngine, useRule } from '@/publicodes-state'
import getValueIsOverFloorOrCeiling from '@/publicodes-state/helpers/getValueIsOverFloorOrCeiling'
import {
  EMPTY_SITUATION,
  useOptionalSimulation,
} from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

/**
 * Extract the numeric floor/ceiling of a rule, using the same defaults as
 * `useContent` does for `useRule`.
 */
function getRuleFloorAndCeiling(rule: {
  rawNode: { plancher?: string | number; plafond?: string | number }
}): { plancher: number; plafond: number } {
  const rawPlancher = rule.rawNode.plancher
  const rawPlafond = rule.rawNode.plafond
  return {
    plafond: typeof rawPlafond === 'number' ? rawPlafond : DEFAULT_PLAFOND,
    plancher: typeof rawPlancher === 'number' ? rawPlancher : DEFAULT_PLANCHER,
  }
}

/**
 * Is "next" disabled because a value is out of bounds, and which questions are
 * over their limit. Reads the pending mosaic draft, so a warning appears while
 * the user types.
 */
export function useQuestionBounds(
  question: DottedName | null,
  /** The draft store: this hook runs above the draft context. */
  store: DraftStore,
  /** The step holding the pending edit, when it is not the question itself. */
  step: DottedName | null = question
): {
  isNextDisabled: boolean
  overLimitQuestions: DottedName[]
} {
  const { safeGetRule } = useEngine()
  const situation = useOptionalSimulation()?.situation ?? EMPTY_SITUATION
  const safeQuestion = question ?? ('bilan' as DottedName)

  const { situationValue, plafond, plancher, questionsOfMosaicFromParent } =
    useRule(safeQuestion)

  // The pending composite if one is staged, the committed one otherwise.
  const values = readMosaicValues(
    store,
    step ?? safeQuestion,
    questionsOfMosaicFromParent,
    situation
  )

  const isOverLimit = ({
    value,
    plancher,
    plafond,
  }: {
    value: number
    plancher: number
    plafond: number
  }): boolean => {
    const { isBelowFloor, isOverCeiling } = getValueIsOverFloorOrCeiling({
      value,
      plancher,
      plafond,
    })
    return isBelowFloor || isOverCeiling
  }

  const overLimitQuestions = useMemo(() => {
    if (!question) return []
    const overLimit: DottedName[] = []

    if (
      typeof situationValue === 'number' &&
      isOverLimit({ value: situationValue, plancher, plafond })
    ) {
      overLimit.push(question)
    }

    questionsOfMosaicFromParent.forEach((mosaicQuestion) => {
      const mosaicQuestionValue = values[mosaicQuestion]
      if (typeof mosaicQuestionValue !== 'number') return
      const mosaicRule = safeGetRule(mosaicQuestion)
      if (!mosaicRule) return
      if (
        isOverLimit({
          value: mosaicQuestionValue,
          ...getRuleFloorAndCeiling(mosaicRule),
        })
      ) {
        overLimit.push(mosaicQuestion)
      }
    })

    return overLimit
  }, [
    situationValue,
    plancher,
    plafond,
    question,
    questionsOfMosaicFromParent,
    values,
    safeGetRule,
  ])

  return {
    isNextDisabled: overLimitQuestions.length > 0,
    overLimitQuestions,
  }
}
