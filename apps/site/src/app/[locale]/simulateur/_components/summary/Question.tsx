'use client'

import ChoicesValue from '@/components/misc/ChoicesValue'
import NumberValue from '@/components/misc/NumberValue'
import { simulateurClickSommaireQuestion } from '@/constants/tracking/pages/simulateur'
import { foldEveryQuestionsUntil } from '@/helpers/foldEveryQuestionsUntil'
import {
  getBackgroundDarkColor,
  getBackgroundLightColor,
  getBorderColor,
  getTextDarkColor,
} from '@/helpers/getCategoryColorClass'
import { useDebug } from '@/hooks/useDebug'
import { useCurrentSimulation, useFormState, useRule } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

export default function Question({
  question,
  toggleQuestionList,
  index,
}: {
  question: DottedName
  toggleQuestionList: () => void
  index: number
}) {
  const {
    label,
    isMissing,
    isFolded,
    value,
    displayValue,
    unit,
    type,
    category,
  } = useRule(question)

  const { updateCurrentSimulation, foldedSteps } = useCurrentSimulation()

  const {
    currentQuestion,
    setCurrentQuestion,
    relevantQuestions,
    missingVariables,
  } = useFormState()

  const isDebug = useDebug()

  const status =
    currentQuestion === question ? 'current' : isFolded ? 'default' : 'missing'

  const isFirstQuestionWithPristineForm =
    foldedSteps?.length === 0 && index === 0

  const isDisabled = !isDebug && !isFirstQuestionWithPristineForm && !isFolded

  return (
    <button
      aria-disabled={isDisabled}
      className={twMerge(
        'relative mb-2 flex w-full flex-col items-start justify-between gap-2 rounded-xl border-2! p-4 text-left font-medium transition-transform md:flex-row md:items-center md:gap-4',
        getBackgroundLightColor(category),
        getTextDarkColor(category),
        status === 'missing' ? '' : getBorderColor(category),
        isDisabled && 'border-gray-300! bg-[#F3F3F3] text-gray-800',
        status === 'current' &&
          `${getBackgroundDarkColor(category)} text-white!`
      )}
      onClick={() => {
        if (isDisabled) return

        if (isDebug) {
          foldEveryQuestionsUntil({
            question,
            relevantQuestions,
            updateCurrentSimulation,
          })
        }
        setCurrentQuestion(question)

        // Reset the scroll position to the top of the page
        window.scrollTo({ top: 0, behavior: 'instant' })

        trackMatomoEvent__deprecated(simulateurClickSommaireQuestion)

        toggleQuestionList()
      }}>
      <div className={twMerge('text-sm md:w-2/3 md:text-base')}>
        {isDebug ? (
          <>
            {question} ({type}, {missingVariables[question] ?? 0})
          </>
        ) : (
          label
        )}
      </div>
      {!isMissing && displayValue !== 'mosaic' ? (
        <div className="align-center flex justify-end whitespace-nowrap md:text-lg">
          <div
            className={twMerge(
              'rounded-xl border-2 bg-white px-4 py-2 first-letter:uppercase',
              isMissing ? 'text-gray-300' : 'text-primary-700',
              getBorderColor(category)
            )}>
            {type === 'number' && (
              <NumberValue displayValue={displayValue} unit={unit} />
            )}
            {type === 'boolean' && displayValue}
            {type === 'choices' &&
              (value ? (
                <ChoicesValue value={value} question={question} />
              ) : null)}
          </div>
        </div>
      ) : null}
    </button>
  )
}
