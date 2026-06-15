import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'

type PodiumItem = {
  rank: number
  label: string
  score: string
}

interface Props {
  items: PodiumItem[]
  className?: string
  locale: Locale
}

function RankBadge({ rank }: { rank: number }) {
  const isFirst = rank === 1

  return (
    <div
      className={twMerge(
        'mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-xl font-medium',
        isFirst
          ? 'bg-secondary-700 text-2xl text-white'
          : 'bg-white text-gray-800'
      )}>
      {rank}
    </div>
  )
}

const heightClasses = {
  1: 'md:h-80',
  2: 'md:h-64',
  3: 'md:h-52',
} as const

const orderClasses = {
  1: 'order-1 md:order-2',
  2: 'order-2 md:order-1',
  3: 'order-3',
} as const

function PodiumBlock({
  rank,
  label,
  score,
  locale,
}: PodiumItem & { locale: Locale }) {
  const isFirst = rank == 1

  return (
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
          'text-center text-base leading-tight font-bold',
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
  )
}

function ListItem({
  rank,
  label,
  score,
  locale,
}: PodiumItem & { locale: Locale }) {
  return (
    <li className="border-primary-600 flex items-center gap-3 border-b px-6 py-4 last:border-b-0">
      <span className="w-10 text-slate-600">
        <span aria-hidden>#</span>
        {rank}
      </span>
      <span className="flex-1 pl-4 font-bold">{label}</span>

      <span>
        {score}{' '}
        <Trans locale={locale} i18nKey="event.podium.list.item.score">
          tests
        </Trans>
      </span>
    </li>
  )
}

export default function PodiumVisual({ items, className, locale }: Props) {
  const podiumItems = items.slice(0, 3)
  const remainingItems = items.slice(3, 10)

  return (
    <>
      {/* Podium */}
      <ol
        className={twMerge(
          'mt-8 mb-12 flex list-none flex-col items-stretch gap-3 md:flex-row md:items-end md:justify-center md:gap-0',
          className
        )}>
        {podiumItems.map(
          (item, i) =>
            item && (
              <li
                key={item.rank}
                className={twMerge(
                  'w-full md:flex-1',
                  orderClasses[item.rank as 1 | 2 | 3]
                )}>
                <PodiumBlock locale={locale} {...item} />
              </li>
            )
        )}
      </ol>

      {/* Remaining rankings */}
      {remainingItems.length > 0 && (
        <ol
          start={4}
          className={twMerge(
            'border-primary-600 mt-6 list-none overflow-hidden rounded-xl border',
            className
          )}>
          {remainingItems.map((item) => (
            <ListItem locale={locale} key={item.rank} {...item} />
          ))}
        </ol>
      )}
    </>
  )
}
