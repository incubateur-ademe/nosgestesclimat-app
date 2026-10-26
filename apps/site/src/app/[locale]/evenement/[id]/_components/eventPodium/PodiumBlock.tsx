import Trans from '@/components/translation/trans/TransServer'
import type { PodiumItem } from '@nosgestesclimat/core/features/events/types/event-info'
import type { EventStatus } from '@nosgestesclimat/core/features/events/types/status'
import { cn } from 'cn'
import AnimatedPodiumBlock from './AnimatedPodiumBlock'
import RankBadge from './RankBadge'

const heightClasses = {
  1: 'md:h-80',
  2: 'md:h-64',
  3: 'md:h-52',
} as const

interface Props extends PodiumItem {
  status: EventStatus
  rank: number
}

export default function PodiumBlock({
  rank,
  name,
  simulationsCount,
  status,
}: Props) {
  const isFirst = rank == 1

  return (
    <AnimatedPodiumBlock rank={rank}>
      <div
        className={cn(
          'flex flex-col items-center justify-start px-4',
          'rounded-3xl md:rounded-t-3xl md:rounded-b-none',
          heightClasses[rank as 1 | 2 | 3],
          isFirst
            ? 'bg-primary-700 py-8 text-white'
            : 'bg-primary-100 py-6 text-gray-800'
        )}>
        <RankBadge rank={rank} />
        <span
          className={cn(
            'mb-6 text-center text-base leading-tight font-bold',
            isFirst && 'text-xl'
          )}>
          {name}
        </span>
        <span
          className={cn(
            'mt-auto text-center text-lg font-bold',
            !isFirst && 'text-primary-600 text-base'
          )}>
          {simulationsCount}{' '}
          <Trans i18nKey="event.podium.list.item.participations">
            participations
          </Trans>
        </span>
        {status === 'not_started' && (
          <span
            className={cn(
              'mt-1 block text-center text-sm',
              !isFirst && 'text-primary-600'
            )}>
            <Trans i18nKey="event.podium.block.score.text2">
              En attente du lancement
            </Trans>
          </span>
        )}
      </div>
    </AnimatedPodiumBlock>
  )
}
