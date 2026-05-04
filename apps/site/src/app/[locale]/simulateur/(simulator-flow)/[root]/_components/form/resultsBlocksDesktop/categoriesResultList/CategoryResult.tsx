'use client'

import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getTextDarkColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import { useFormState, useRule } from '@/publicodes-state'
import type { DottedName, Metrics } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

export default function CategoryResult({
  category,
  metric,
}: {
  category: DottedName
  metric: Metrics
}) {
  const locale = useLocale()
  const { t } = useClientTranslation()

  const {
    remainingQuestionsByCategories,
    currentCategory,
    questionsByCategories,
  } = useFormState()

  const { title, icons, numericValue } = useRule(category, metric)

  const completion =
    (questionsByCategories[category].length -
      remainingQuestionsByCategories[category].length) /
    questionsByCategories[category].length

  const isCompleted = completion === 1
  const isStarted = completion > 0
  const isCurrent = currentCategory === category

  const { formattedValue, unit } = formatFootprint(numericValue, {
    t,
    locale,
    metric,
  })

  const isValueZero = formattedValue === '0'

  return (
    <div
      className={twMerge(
        'relative mb-0 flex w-full items-center justify-between gap-4 overflow-hidden bg-white px-4 py-2 text-sm transition-colors',
        isStarted || isCurrent ? 'text-default' : 'text-slate-600'
      )}>
      <div
        className={twMerge(
          'relative flex items-center text-sm font-normal',
          getTextDarkColor(category)
        )}>
        <Emoji
          className={twMerge(
            isStarted || isCurrent ? 'opacity-100' : 'opacity-50',
            'mr-2 transition-opacity'
          )}>
          {icons}
        </Emoji>
        <span>{title}</span>{' '}
      </div>
      <span
        className={twMerge(
          'relative block font-semibold transition-opacity',
          isCompleted || isStarted
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        )}>
        {(isCompleted || isStarted) && !isValueZero ? (
          <>
            <span>{formattedValue}</span>{' '}
            <span className="font-normal">{unit}</span>
          </>
        ) : (
          '--'
        )}
      </span>
    </div>
  )
}
