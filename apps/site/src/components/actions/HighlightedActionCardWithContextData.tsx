'use client'

import { useActionContext } from './contexts/action'
import HighlightedActionCard, {
  type HighlightedActionCardProps,
} from './HighlightedActionCard'

export default function HighlightedActionCardWithContextData({
  action,
  rank,
}: Pick<HighlightedActionCardProps, 'action' | 'rank'>) {
  const { from, locale, totalFootprint } = useActionContext()
  return (
    <HighlightedActionCard
      totalFootprint={totalFootprint}
      from={from}
      locale={locale}
      action={action}
      rank={rank}
    />
  )
}
