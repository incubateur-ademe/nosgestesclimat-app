import Emoji from '@/design-system/utils/Emoji'
import { useIsClient } from '@/hooks/useIsClient'
import { useRule } from '@/publicodes-state'
import type { DottedName, FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from "cn";

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

  // The engine only exists on the client (see `useEngine`): the icon and the
  // title it holds would be missing from the server's render, and React would
  // regenerate the tree. Waiting for the mount keeps both renders identical.
  const isClient = useIsClient()

  const itemValue = funFacts?.[funFactKey as keyof FunFacts]

  if (!isClient || itemValue === undefined || itemValue === null) {
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
