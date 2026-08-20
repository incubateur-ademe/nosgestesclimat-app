import { useMosaicState } from '@/components/form/question/mosaic/useMosaicState'
import { DEFAULT_PLAFOND, DEFAULT_PLANCHER } from '@/constants/model/bounds'
import { useEngine, useRule } from '@/publicodes-state'
import getValueIsOverFloorOrCeiling from '@/publicodes-state/helpers/getValueIsOverFloorOrCeiling'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

/**
 * Extract the numeric floor/ceiling of a rule, using the same defaults as
 * `useContent` does for `useRule`. Duplicate the logic of `useContent` here to avoid calling `useRule` in a loop, maybe we can do better.
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
 * Determine if the "next" button of the navigation should be disabled because
 * the current numeric value — or one of the numeric mosaic children values —
 * is out of bounds (below its floor or above its ceiling).
 *
 * Each mosaic child has its own `plancher`/`plafond`, so we read them per
 * child (via `safeGetRule`) rather than reusing the parent's ones.
 *
 * Returns both a boolean (`isNextDisabled`) and the list of questions whose
 * bound is exceeded (`overLimitQuestions`), so callers can display a warning
 * per concerned question.
 */
export function useIsDisabledByBounds(question: DottedName): {
  isNextDisabled: boolean
  overLimitQuestions: DottedName[]
} {
  const { safeGetRule } = useEngine()

  const { situationValue, plafond, plancher, questionsOfMosaicFromParent } =
    useRule(question)

  const { values } = useMosaicState({
    questionsOfMosaic: questionsOfMosaicFromParent,
    question,
  })

  /**
   * Return `true` when the value is out of bounds (below its floor or above
   * its ceiling), `false` otherwise.
   */
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
    const overLimit: DottedName[] = []

    // The question itself
    if (
      typeof situationValue === 'number' &&
      isOverLimit({
        value: situationValue,
        plancher,
        plafond,
      })
    ) {
      overLimit.push(question)
    }

    // Mosaic children
    questionsOfMosaicFromParent.forEach((mosaicQuestion) => {
      const mosaicQuestionValue = values[mosaicQuestion]
      if (typeof mosaicQuestionValue !== 'number') {
        return
      }

      const mosaicRule = safeGetRule(mosaicQuestion)
      if (!mosaicRule) {
        return
      }

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

  const isNextDisabled = overLimitQuestions.length > 0

  return {
    isNextDisabled,
    overLimitQuestions,
  }
}
