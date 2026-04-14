'use client'

import { captureClickSuggestion } from '@/constants/tracking/posthogTrackers'
import { questionClickSuggestion } from '@/constants/tracking/question'
import { baseClassNames, sizeClassNames } from '@/design-system/buttons/Button'
import Emoji from '@/design-system/utils/Emoji'
import {
  getBgCategoryColor,
  getBorderCategoryColor,
  getCategoryFocusRingClassName,
  getHoverBgCategoryColor,
  getHoverBorderCategoryColor,
  getTextCategoryColor,
} from '@/helpers/getCategoryColorClass'
import { useFormState, useRule } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { capitalizeString } from '@/utils/capitalizeString'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

interface Props {
  question: DottedName
  setValue: (value: NodeValue | Record<string, NodeValue>) => void
}

export default function Suggestions({ question, setValue }: Props) {
  const { suggestions } = useRule(question)

  const { currentCategory } = useFormState()

  if (!suggestions?.length) return

  return (
    <div className="mb-6 flex flex-wrap justify-start gap-x-2 gap-y-2.5 text-sm">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          data-testid={`suggestion-${suggestion.value}`}
          className={twMerge(
            'text-xs font-medium transition-colors md:text-sm',
            baseClassNames,
            sizeClassNames.sm,
            getBgCategoryColor(currentCategory, '200'),
            getBorderCategoryColor(currentCategory, '200'),
            getTextCategoryColor(currentCategory, '900'),
            getHoverBgCategoryColor(currentCategory, '300'),
            getHoverBorderCategoryColor(currentCategory, '300'),
            getCategoryFocusRingClassName(currentCategory ?? '')
          )}
          onClick={() => {
            trackMatomoEvent__deprecated(
              questionClickSuggestion({ question, answer: suggestion.label })
            )
            trackPosthogEvent(
              // We only send suggestion value for non mosaic questions
              captureClickSuggestion({
                question,
                answer:
                  typeof suggestion.value !== 'object' && suggestion.value,
                label: suggestion.label,
              })
            )
            setValue(suggestion.value)
          }}
          aria-label={suggestion.label}>
          <Emoji className="flex items-center gap-1 leading-none">
            {capitalizeString(suggestion.label)}
          </Emoji>
        </button>
      ))}
    </div>
  )
}
