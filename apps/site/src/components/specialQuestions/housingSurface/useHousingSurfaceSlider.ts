'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useState } from 'react'

const SURFACE_SLIDER_ID = 'housing-surface-slider'
const SURFACE_SLIDER_MIN = 10
const SURFACE_SLIDER_MAX = 250
const SURFACE_UNIT = 'm²'
const SURFACE_THRESHOLDS = {
  studioBelow: 30,
  twoRoomsBelow: 50,
  threeRoomsBelow: 70,
  fourRoomsBelow: 100,
} as const

export function useHousingSurfaceSlider(question: DottedName) {
  const { t } = useClientTranslation()

  const {
    value: ruleValue,
    situationValue,
    setValue: setRuleValue,
  } = useRule(question)

  const [surface, setSurface] = useState(() =>
    getInitialSurface({ situationValue, ruleValue })
  )

  const handleValueCommit = useCallback(
    (nextSurface: number) => {
      setSurface(nextSurface)
      setRuleValue(nextSurface, { questionDottedName: question })
    },
    [question, setRuleValue]
  )

  const hintLabels: Record<HintKey, string> = {
    studio: t(
      'simulator.customQuestions.housingSurface.hint.studio',
      'une pièce environ (studio)'
    ),
    twoRooms: t(
      'simulator.customQuestions.housingSurface.hint.twoRooms',
      'environ un 2 pièces (1 chambre)'
    ),
    threeRooms: t(
      'simulator.customQuestions.housingSurface.hint.threeRooms',
      'environ un 3 pièces (2 chambres)'
    ),
    fourRooms: t(
      'simulator.customQuestions.housingSurface.hint.fourRooms',
      'environ un 4 pièces (3 chambres)'
    ),
    fiveRooms: t(
      'simulator.customQuestions.housingSurface.hint.fiveRooms',
      'Plus de 5 pièces (4 chambres)'
    ),
  }

  return {
    id: SURFACE_SLIDER_ID,
    value: surface,
    min: SURFACE_SLIDER_MIN,
    max: SURFACE_SLIDER_MAX,
    unit: SURFACE_UNIT,
    instructionLabel: t(
      'simulator.customQuestions.housingSurface.instruction',
      'Utilisez le curseur pour renseigner la surface :'
    ),
    hint: hintLabels[getHintKey(surface)],
    minLabel: t(
      'simulator.customQuestions.housingSurface.minLabel',
      `${SURFACE_SLIDER_MIN} ${SURFACE_UNIT}`
    ),
    maxLabel: t(
      'simulator.customQuestions.housingSurface.maxLabel',
      `${SURFACE_SLIDER_MAX} ${SURFACE_UNIT} et +`
    ),
    onValueChange: setSurface,
    onValueCommit: handleValueCommit,
  }
}

type HintKey = 'studio' | 'twoRooms' | 'threeRooms' | 'fourRooms' | 'fiveRooms'

function getHintKey(surface: number): HintKey {
  if (surface < SURFACE_THRESHOLDS.studioBelow) return 'studio'
  if (surface < SURFACE_THRESHOLDS.twoRoomsBelow) return 'twoRooms'
  if (surface < SURFACE_THRESHOLDS.threeRoomsBelow) return 'threeRooms'
  if (surface < SURFACE_THRESHOLDS.fourRoomsBelow) return 'fourRooms'
  return 'fiveRooms'
}

/**
 * Rounds to a whole square metre and clamps to the slider bounds: the model
 * default is decimal (64.7 / 112.8) and its own bounds (1–999) exceed the
 * 10–250 slider range.
 */
function clampSurface(surface: number): number {
  return Math.min(
    SURFACE_SLIDER_MAX,
    Math.max(SURFACE_SLIDER_MIN, Math.round(surface))
  )
}

function getInitialSurface({
  situationValue,
  ruleValue,
}: {
  situationValue: NodeValue
  ruleValue: NodeValue
}): number {
  if (typeof situationValue === 'number') {
    return clampSurface(situationValue)
  }
  if (typeof ruleValue === 'number') {
    return clampSurface(ruleValue)
  }
  return SURFACE_SLIDER_MIN
}
