'use client'

import BooleanInput from '@/components/form/question/BooleanInput'
import ChoicesInput from '@/components/form/question/ChoicesInput'
import Label from '@/components/form/question/Label'
import Mosaic from '@/components/form/question/Mosaic'
import Notification from '@/components/form/question/Notification'
import NumberInput from '@/components/form/question/NumberInput'
import Suggestions from '@/components/form/question/Suggestions'
import {
  DEFAULT_FOCUS_ELEMENT_ID,
  QUESTION_DESCRIPTION_BUTTON_ID,
} from '@/constants/accessibility'
import { questionChooseAnswer } from '@/constants/tracking/question'
import { WARNING_MESSAGE_ID } from '@/constants/warning'
import Button from '@/design-system/buttons/Button'
import { getWarningId } from '@/helpers/accessibility/getWarningId'
import { useUpdatePageTitle } from '@/hooks/simulation/useUpdatePageTitle'
import { useIsDisabledByBounds } from '@/hooks/useIsDisabledByBounds'
import { useLocale } from '@/hooks/useLocale'
import { useFormState, useRule } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { AnimatePresence } from 'framer-motion'
import type { Evaluation } from 'publicodes'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransClient'
import DontKnowButton from './question/DontKnowButton'
import NumberInputWithAssistance from './question/NumberInputWithAssistance'
import Warning from './question/Warning'

interface Props {
  question: DottedName
  showInputsLabel?: React.ReactNode | string
  headingLevel?: 1 | 2 | 3
  className?: string
}

export default function Question({
  question,
  showInputsLabel,
  headingLevel,
  className,
}: Props) {
  const {
    type,
    label,
    description,
    unit,
    value,
    situationValue,
    setValue,
    isMissing,
    choices,
    assistance,
    questionsOfMosaicFromParent,
    activeNotifications,
    category,
  } = useRule(question)

  const { overLimitQuestions } = useIsDisabledByBounds(question)

  const { questionsByCategories } = useFormState()

  const currentCategoryQuestions = questionsByCategories[category]

  const refCurrentCategoryQuestions = useRef(currentCategoryQuestions)

  // Set dynamically the page title
  useUpdatePageTitle({
    category,
    countCategoryQuestions: currentCategoryQuestions.length,
    currentQuestionIndex:
      refCurrentCategoryQuestions.current.indexOf(question) + 1,
  })

  const [isOpen, setIsOpen] = useState(showInputsLabel ? false : true)
  const locale = useLocale()

  const numberInputProps = {
    question,
    unit,
    value: situationValue as Evaluation<number>,
    setValue: (value: number | string | undefined) => {
      setValue(value, { questionDottedName: question })
    },
    placeholder:
      isMissing && typeof value === 'number'
        ? value.toLocaleString(locale, {
            maximumFractionDigits: value < 10 ? 1 : 0,
          })
        : '',
    'data-testid': question,
    id: DEFAULT_FOCUS_ELEMENT_ID,
    'aria-describedby': `${QUESTION_DESCRIPTION_BUTTON_ID}-content warning-message notification-message`,
    'aria-labelledby': 'question-label',
  }

  return (
    <>
      <div className={twMerge('mb-6 flex flex-col items-start', className)}>
        <Label
          question={question}
          label={label}
          description={description}
          headingLevel={headingLevel}
          id="question-label"
        />

        <Suggestions
          question={question}
          setValue={(value) => {
            setValue(value, { questionDottedName: question })
          }}
        />
        {showInputsLabel ? (
          <Button
            color="link"
            size="xs"
            onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
            className="mb-2">
            {isOpen ? <Trans>Fermer</Trans> : showInputsLabel}
          </Button>
        ) : null}
        {isOpen && (
          <>
            {type === 'number' &&
              (assistance ? (
                <NumberInputWithAssistance
                  {...numberInputProps}
                  // Unit is required on assistance mode
                  unit={unit!}
                  assistance={assistance}
                />
              ) : (
                <NumberInput {...numberInputProps} />
              ))}

            {type === 'boolean' && (
              <BooleanInput
                value={situationValue as Evaluation<boolean>}
                setValue={(value: string | undefined) => {
                  {
                    setValue(value, { questionDottedName: question })
                    trackMatomoEvent__deprecated(
                      questionChooseAnswer({ question, answer: value })
                    )
                  }
                }}
                data-testid={question}
                label={label || ''}
                firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
                aria-describedby={`${QUESTION_DESCRIPTION_BUTTON_ID}-content warning-message notification-message`}
                aria-labelledby="question-label"
              />
            )}

            {type === 'choices' && (
              <ChoicesInput
                question={question}
                choices={choices}
                value={situationValue as Evaluation<string>}
                setValue={(value) => {
                  {
                    setValue(value, { questionDottedName: question })
                    trackMatomoEvent__deprecated(
                      questionChooseAnswer({ question, answer: value })
                    )
                  }
                }}
                data-testid={question}
                label={label || ''}
                firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
                aria-describedby={`${QUESTION_DESCRIPTION_BUTTON_ID}-content warning-message notification-message`}
                aria-labelledby="question-label"
              />
            )}

            {(type === 'numberMosaic' || type === 'selectMosaic') && (
              <Mosaic
                question={question}
                questionsOfMosaic={questionsOfMosaicFromParent}
                aria-describedby={`${QUESTION_DESCRIPTION_BUTTON_ID}-content  warning-message notification-message`}
                aria-labelledby="question-label"
                firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
                label={label || ''}
                overLimitQuestions={overLimitQuestions}
              />
            )}
          </>
        )}
      </div>

      {/* AnimatePresence stays mounted so exit animations play when a warning is removed */}
      <AnimatePresence>
        {overLimitQuestions.map((overLimitQuestion) => (
          <Warning
            key={overLimitQuestion}
            question={overLimitQuestion}
            id={
              overLimitQuestion === question
                ? WARNING_MESSAGE_ID
                : getWarningId(overLimitQuestion)
            }
          />
        ))}
      </AnimatePresence>

      {activeNotifications.length > 0 && (
        <Notification
          notification={activeNotifications[activeNotifications.length - 1]}
        />
      )}
      <DontKnowButton question={question} />
    </>
  )
}
