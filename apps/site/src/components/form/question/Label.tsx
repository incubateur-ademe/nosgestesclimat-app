'use client'

import Trans from '@/components/translation/trans/TransClient'
import { QUESTION_DESCRIPTION_BUTTON_ID } from '@/constants/accessibility'
import { captureClickInfo } from '@/constants/tracking/posthogTrackers'
import {
  questionCloseInfo,
  questionOpenInfo,
} from '@/constants/tracking/question'
import Button from '@/design-system/buttons/Button'
import Markdown from '@/design-system/utils/Markdown'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation } from '@/publicodes-state'
import { MUST_SHOW_DESCRIPTION } from '@/publicodes-state/constants/questions'
import type { QuestionSize } from '@/types/values'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { twMerge } from 'tailwind-merge'

interface Props {
  question: DottedName
  label?: string
  description?: string
  size?: QuestionSize
  className?: string
  titleClassName?: string
  headingLevel?: 1 | 2 | 3
  id?: string
  htmlFor?: string
}

const sizeClassNames = { sm: 'mb-1 text-sm', md: 'mb-3 text-lg md:text-2xl' }

export default function Label({
  question,
  label,
  description,
  size = 'md',
  className,
  titleClassName,
  headingLevel = 2,
  id,
  htmlFor,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useClientTranslation()

  const mustShowDescription =
    getSimulationMode(useCurrentSimulation()) === 'scolaire' ||
    MUST_SHOW_DESCRIPTION.has(question)

  if (!label) return
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <label
        className={twMerge(
          `flex ${sizeClassNames[size]} gap-2 font-semibold`,
          className
        )}
        id={id}
        htmlFor={htmlFor}
        aria-label={label}
        // This is a hack to avoid the default <label> element behavior
        // of triggering the first input (here the button) it
        onClick={(e) => e.preventDefault()}>
        {headingLevel === 1 ? (
          <h1
            className={twMerge(
              'mb-0 inline flex-1 text-lg md:text-xl [&_p]:mb-0',
              titleClassName
            )}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            id={QUESTION_DESCRIPTION_BUTTON_ID}
            data-testid="question-label">
            <Markdown>{label}</Markdown>
          </h1>
        ) : headingLevel === 2 ? (
          <h2
            className={twMerge(
              'mb-0 inline flex-1 text-lg md:text-xl [&_p]:mb-0',
              titleClassName
            )}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            id={QUESTION_DESCRIPTION_BUTTON_ID}
            data-testid="question-label">
            <Markdown>{label}</Markdown>
          </h2>
        ) : (
          <h3
            className={twMerge(
              'mb-0 inline flex-1 text-lg md:text-xl [&_p]:mb-0',
              titleClassName
            )}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            id={QUESTION_DESCRIPTION_BUTTON_ID}
            data-testid="question-label">
            <Markdown>{label}</Markdown>
          </h3>
        )}
        {description && !mustShowDescription ? (
          <Button
            type="button"
            onClick={() => {
              if (isOpen) {
                trackMatomoEvent__deprecated(questionCloseInfo({ question }))
                trackPosthogEvent(
                  captureClickInfo({ question, state: 'closed' })
                )
              } else {
                trackMatomoEvent__deprecated(questionOpenInfo({ question }))
                trackPosthogEvent(
                  captureClickInfo({ question, state: 'opened' })
                )
              }
              setIsOpen((previsOpen) => !previsOpen)
            }}
            color="secondary"
            size="xs"
            aria-expanded={isOpen ? true : false}
            aria-controls={`${QUESTION_DESCRIPTION_BUTTON_ID}-content`}
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full p-0 align-text-bottom font-mono`}
            title={t(
              'simulator.label.moreInfoButton',
              "Plus d'informations - {{label}}",
              { label }
            )}
            aria-label={t(
              'simulator.label.moreInfoButton',
              "Plus d'informations - {{label}}",
              { label }
            )}>
            <span aria-hidden="true">i</span>
            <span className="sr-only">
              {t(
                'simulator.label.moreInfoButton',
                "Plus d'informations - {{label}}",
                { label }
              )}
            </span>
          </Button>
        ) : null}
      </label>
      {description &&
        (mustShowDescription ? (
          <div
            id={`${QUESTION_DESCRIPTION_BUTTON_ID}-content`}
            role="region"
            aria-labelledby={QUESTION_DESCRIPTION_BUTTON_ID}
            className="mb-4 text-xs italic md:text-sm">
            <Markdown>{description}</Markdown>
          </div>
        ) : isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            id={`${QUESTION_DESCRIPTION_BUTTON_ID}-content`}
            role="region"
            aria-labelledby={QUESTION_DESCRIPTION_BUTTON_ID}
            className="border-primary-50 mb-3 w-full origin-top rounded-xl border-2 bg-gray-100 p-3 text-sm">
            <Markdown className="[&>blockquote]:text-default [&>blockquote]:mt-0 [&>blockquote]:mb-2 [&>blockquote]:p-0 [&>p]:mb-2">
              {description}
            </Markdown>{' '}
            <div className="mt-1 flex justify-end">
              <Button
                size="xs"
                color="secondary"
                onClick={() => {
                  trackMatomoEvent__deprecated(questionCloseInfo({ question }))
                  setIsOpen(false)
                }}
                title={t('Fermer')}>
                <Trans>Fermer</Trans>
              </Button>
            </div>
          </motion.div>
        ) : null)}
    </>
  )
}
