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
import Button from '@/design-system/buttons/Button'
import {
  useFormAdvancement,
  useFormNavigation,
  useFormQuestion,
  type FormQuestion,
} from '@/form-controller'
import { getWarningId } from '@/helpers/question/getWarningId'
import { useUpdatePageTitle } from '@/hooks/simulation/useUpdatePageTitle'
import { useLocale } from '@/hooks/useLocale'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { cn } from 'cn'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Trans from '../translation/trans/TransClient'
import DontKnowButton from './question/DontKnowButton'
import NumberInputWithAssistance from './question/NumberInputWithAssistance'
import Warning from './question/Warning'

/**
 * The input matching the question's type. The switch gives each branch its own
 * variant, so a number branch sees a number — no cast, no assertion.
 */
function QuestionInput({
  formQuestion,
  warningId,
}: {
  formQuestion: FormQuestion
  warningId: string
}) {
  const locale = useLocale()

  const common = {
    'data-testid': formQuestion.question,
    'aria-describedby': `${QUESTION_DESCRIPTION_BUTTON_ID}-content ${warningId} notification-message`,
    'aria-labelledby': 'question-label',
  }

  switch (formQuestion.type) {
    case 'number': {
      const placeholder =
        formQuestion.isMissing && typeof formQuestion.defaultValue === 'number'
          ? formQuestion.defaultValue.toLocaleString(locale, {
              maximumFractionDigits: formQuestion.defaultValue < 10 ? 1 : 0,
            })
          : ''

      const numberProps = {
        ...common,
        unit: formQuestion.unit,
        value: formQuestion.value,
        setValue: formQuestion.setValue,
        placeholder,
        id: DEFAULT_FOCUS_ELEMENT_ID,
      }

      return formQuestion.assistance ? (
        <NumberInputWithAssistance
          {...numberProps}
          assistance={formQuestion.assistance}
        />
      ) : (
        <NumberInput {...numberProps} />
      )
    }

    case 'boolean':
      return (
        <BooleanInput
          {...common}
          value={formQuestion.value}
          setValue={formQuestion.setValue}
          label={formQuestion.label || ''}
          firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
        />
      )

    case 'choices':
      return (
        <ChoicesInput
          {...common}
          question={formQuestion.question}
          choices={formQuestion.choices}
          value={formQuestion.value}
          setValue={formQuestion.setValue}
          label={formQuestion.label || ''}
          firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
        />
      )

    case 'numberMosaic':
    case 'selectMosaic':
      return <Mosaic formQuestion={formQuestion} />
  }
}

interface Props {
  question: DottedName
  showInputsLabel?: React.ReactNode | string
  headingLevel?: 1 | 2 | 3
  className?: string
  beforeInputsHelpText?: React.ReactNode | string | null
}

export default function Question({
  question,
  showInputsLabel,
  headingLevel,
  className,
  beforeInputsHelpText,
}: Props) {
  const formQuestion = useFormQuestion(question)
  const { questionPosition } = useFormAdvancement()
  const { skipQuestion } = useFormNavigation()

  const [isOpen, setIsOpen] = useState(showInputsLabel ? false : true)

  // Set dynamically the page title, for the question actually rendered: a
  // custom question renders its own nested questions.
  const position = questionPosition(question)
  useUpdatePageTitle({
    category: position.category,
    countCategoryQuestions: position.count,
    currentQuestionIndex: position.index,
  })

  const { label, description, overLimitQuestions, activeNotifications } =
    formQuestion
  const warningId = getWarningId(question)
  const lastNotification = activeNotifications.at(-1)

  return (
    <>
      <div className={cn('mb-6 flex flex-col items-start', className)}>
        <Label
          question={question}
          label={label}
          description={description}
          headingLevel={headingLevel}
          id="question-label"
        />

        <Suggestions
          question={question}
          suggestions={formQuestion.suggestions}
          commitNow={formQuestion.commitNow}
        />

        {showInputsLabel ? (
          <Button
            variant="link"
            size="xs"
            onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
            className="mb-2">
            {isOpen ? <Trans>Fermer</Trans> : showInputsLabel}
          </Button>
        ) : null}

        {beforeInputsHelpText}
        {isOpen && (
          <QuestionInput formQuestion={formQuestion} warningId={warningId} />
        )}
      </div>

      {/* AnimatePresence stays mounted so exit animations play when a warning is removed */}
      <AnimatePresence>
        {overLimitQuestions.map((overLimitQuestion) => (
          <Warning
            key={overLimitQuestion}
            question={overLimitQuestion}
            id={getWarningId(overLimitQuestion)}
          />
        ))}
      </AnimatePresence>

      {lastNotification && <Notification notification={lastNotification} />}
      <DontKnowButton
        isMissing={formQuestion.isMissing}
        onSkip={() => skipQuestion(question)}
      />
    </>
  )
}
