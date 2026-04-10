import Emoji from '@/design-system/utils/Emoji'
import { useRule } from '@/publicodes-state'
import type { DottedName, FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

interface Props {
  funFactKey: string
  dottedName: DottedName
  funFacts: FunFacts
  small?: boolean
}

export default function FunFactsItem({
  funFactKey,
  dottedName,
  funFacts,
  small,
}: Props) {
  const { title, icons } = useRule(dottedName)

  const itemValue = funFacts?.[funFactKey as keyof FunFacts]

  if (itemValue === undefined || itemValue === null) {
    return null
  }

  return (
    <div className="inline-flex text-lg">
      <Emoji className="mr-2 flex min-w-6 items-center">{icons}</Emoji>
      <div className="flex items-center justify-center">
        <div>
          <span
            className={twMerge('text-2xl font-medium', small ? 'text-lg' : '')}>
            {Math.round(itemValue)}
          </span>{' '}
          <span>{funFactKey.includes('percentage') && '%'}</span>{' '}
          <span className={small ? 'text-base' : ''}>{title}</span>
        </div>
      </div>
    </div>
  )
}
