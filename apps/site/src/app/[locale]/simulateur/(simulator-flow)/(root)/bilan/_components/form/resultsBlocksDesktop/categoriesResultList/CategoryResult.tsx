'use client'

import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getTextDarkColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIsClient } from '@/hooks/useIsClient'
import { useLocale } from '@/hooks/useLocale'
import { useFormState, useRule } from '@/publicodes-state'
import type { DottedName, Metrics } from '@incubateur-ademe/nosgestesclimat'
import { cn } from 'cn'

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

  // The engine only exists on the client (see `useEngine`), so the title, the
  // icons and the completion are unknown on the server: rendered there, `Emoji`
  // falls back to text where the client renders an image. Waiting for the mount
  // keeps both renders identical.
  const isClient = useIsClient()

  const completion =
    (questionsByCategories[category].length -
      remainingQuestionsByCategories[category].length) /
    questionsByCategories[category].length

  const isCompleted = isClient && completion === 1
  const isStarted = isClient && completion > 0
  const isCurrent = isClient && currentCategory === category

  const { formattedValue, unit } = formatFootprint(numericValue, {
    t,
    locale,
    metric,
  })

  const isValueZero = formattedValue === '0'

  return (
    <div
      className={cn(
        'relative mb-0 flex w-full items-center justify-between gap-4 overflow-hidden bg-white px-4 py-2 text-sm transition-colors',
        isStarted || isCurrent ? 'text-default' : 'text-slate-600'
      )}>
      <div
        className={cn(
          'relative flex items-center text-sm font-normal',
          getTextDarkColor(category)
        )}>
        <Emoji
          className={cn(
            isStarted || isCurrent ? 'opacity-100' : 'opacity-50',
            'mr-2 transition-opacity'
          )}>
          {isClient ? icons : undefined}
        </Emoji>
        <span>{isClient ? title : null}</span>{' '}
      </div>
      <span
        className={cn(
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
