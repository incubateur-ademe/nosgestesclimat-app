import { useCurrentSimulation, useEngine, useRule } from '@/publicodes-state'
import { safeEvaluateHelper } from '@/publicodes-state/helpers/safeEvaluateHelper'
import type { PublicodesValue } from '@/publicodes-state/types'
import { useDebounce } from '@/utils/debounce'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Evaluation } from 'publicodes'
import { useState } from 'react'
import type { NumberFormatValues, SourceInfo } from 'react-number-format'
import { useNumberInputState } from './useNumberInputState'

interface NumberInputWithAssistanceStateProps {
  question: DottedName
  unit: string
  value: Evaluation<number>
  placeholder: string
  setValue: (value: number | undefined) => void
  assistance: DottedName
}

interface FuncProps {
  assistanceValue: Evaluation<PublicodesValue>
  questionValue: Evaluation<number>
  assistanceUnit?: string
  defaultUnit: string
}

const getWhichUnitToShowByDefault = ({
  assistanceValue,
  questionValue,
  assistanceUnit,
  defaultUnit,
}: FuncProps) => {
  if (
    // Question unanswered default case
    (!assistanceValue && !questionValue) ||
    // Assistance answered
    (assistanceValue && questionValue)
  ) {
    return assistanceUnit
  }

  // Case where user has directly answered the question
  if (!assistanceValue && questionValue) return defaultUnit

  // Should not happen, but well..
  return defaultUnit
}

export const useNumberInputWithAssistanceState = ({
  question,
  unit: defaultUnit,
  value: defaultValue,
  placeholder,
  assistance,
  setValue,
}: NumberInputWithAssistanceStateProps) => {
  const { value, onChange } = useNumberInputState({
    value: defaultValue,
    setValue,
  })

  const { engine, addToEngineSituation } = useEngine()

  const { updateCurrentSimulation, foldedSteps } = useCurrentSimulation()

  const { situationValue: situationValueQuestion } = useRule(question)

  const {
    parent: assistanceParent,
    unit: assistanceUnit,
    situationValue: situationValueAssistance,
  } = useRule(assistance)

  // Default to the assistance unit when an assistance rule is provided,
  // so the input label matches the unit the user is expected to type in.
  const [currentUnit, updateCurrentUnit] = useState(
    getWhichUnitToShowByDefault({
      assistanceUnit,
      assistanceValue: situationValueAssistance,
      questionValue: value!,
      defaultUnit,
    })
  )

  // Back-propagate the derived value to the parent question rule
  // so both stay consistent in the simulation situation
  function syncQuestionAndAssistance({
    nextValue,
    assistanceDottedName,
  }: {
    nextValue: number | undefined
    assistanceDottedName: DottedName
  }) {
    // Mark the question as answered in the foldedSteps when
    // updating the assistance value
    const newFoldedSteps = foldedSteps.includes(question)
      ? foldedSteps
      : [...foldedSteps, question]

    // Speculatively apply the assistance value to compute what the question's
    // value would be, without committing to the global situation yet.
    const newEngine = engine!.setSituation(
      { [assistanceDottedName]: nextValue },
      { keepPreviousSituation: true }
    )
    const questionNodeValue = safeEvaluateHelper(assistanceParent, newEngine)

    // Persist both the assistance and the derived question values atomically.
    const safeAndCleanSituation = addToEngineSituation({
      [assistanceDottedName]: nextValue,
      [question]: questionNodeValue?.nodeValue,
    })

    updateCurrentSimulation({
      situation: safeAndCleanSituation,
      foldedSteps: newFoldedSteps,
    })
  }

  const debouncedSyncQuestionAndAssistance = useDebounce(
    syncQuestionAndAssistance,
    300
  )

  const handleValueChange = (
    values: NumberFormatValues,
    sourceInfo: SourceInfo
  ) => {
    // Ignore updates triggered by a prop change (external value update),
    // only process genuine user-input events to avoid feedback loops.
    if ((sourceInfo.source as string) !== 'event') return

    // When the displayed unit matches the assistance unit, route through the
    // sync helper so both rules are updated together.
    if (currentUnit === assistanceUnit) {
      debouncedSyncQuestionAndAssistance({
        nextValue: values.floatValue,
        assistanceDottedName: assistance,
      })
      return
    }

    // Default case
    onChange(values)
  }

  return {
    currentUnit,
    assistanceUnit,
    updateCurrentUnit,
    value:
      currentUnit && currentUnit === assistanceUnit
        ? situationValueAssistance
        : (value ?? situationValueQuestion),
    placeholder:
      currentUnit && currentUnit === assistanceUnit
        ? // There is no placeholder value for assistance
          '0'
        : value === undefined
          ? placeholder
          : '',
    handleValueChange,
  }
}
