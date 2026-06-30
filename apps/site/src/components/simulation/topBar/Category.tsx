import Emoji from '@/design-system/utils/Emoji'
import { getCategoryTitle } from '@/helpers/formatters/getCategoryTitle'
import { getTextDarkColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

export default function Category({ category }: { category: DottedName }) {
  const { icons, title } = useRule(category)

  const { t } = useClientTranslation()

  return (
    <div className="flex">
      <h1
        className={twMerge(
          'mb-0 text-base font-bold lg:text-lg',
          getTextDarkColor(category)
        )}>
        <Emoji>{icons}</Emoji>{' '}
        {getCategoryTitle({ dottedName: category, ruleTitle: title ?? '', t })}
      </h1>
    </div>
  )
}
