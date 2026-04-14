import Emoji from '@/design-system/utils/Emoji'
import { getTextDarkColor } from '@/helpers/getCategoryColorClass'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

export default function Category({
  category,
}: {
  category: DottedName | null
}) {
  const { icons, title } = useRule(category || 'transport')

  return (
    <div className="flex">
      <h1
        className={twMerge(
          'mb-0 text-base font-bold lg:text-lg',
          getTextDarkColor(category)
        )}>
        <Emoji>{icons}</Emoji> {title}
      </h1>
    </div>
  )
}
