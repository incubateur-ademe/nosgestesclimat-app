import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import type { PodiumItem } from '../../_helpers/eventPageData'
import AnimatedPodiumBlock from './AnimatedPodiumBlock'
import RankBadge from './RankBadge'

const heightClasses = {
  1: 'md:h-80',
  2: 'md:h-64',
  3: 'md:h-52',
} as const

interface Props extends PodiumItem {
  locale: Locale
}

export default function PodiumBlock({ rank, label, score, locale }: Props) {
  const isFirst = rank == 1

  return (
    <AnimatedPodiumBlock rank={rank}>
      <div
        className={twMerge(
          'flex flex-col items-center justify-start px-4',
          'rounded-3xl md:rounded-t-3xl md:rounded-b-none',
          heightClasses[rank as 1 | 2 | 3],
          isFirst
            ? 'bg-primary-700 py-8 text-white'
            : 'bg-primary-100 py-6 text-gray-800'
        )}>
        <RankBadge rank={rank} />
        <span
          className={twMerge(
            'mb-6 text-center text-base leading-tight font-bold',
            isFirst && 'text-xl'
          )}>
          {label}
        </span>
        <span
          className={twMerge(
            'mt-auto text-lg font-bold',
            !isFirst && 'text-primary-600 text-base'
          )}>
          {score}{' '}
          <Trans locale={locale} i18nKey="event.podium.block.score.text">
            calculs d'empreinte
          </Trans>
        </span>
      </div>
    </AnimatedPodiumBlock>
  )
}
