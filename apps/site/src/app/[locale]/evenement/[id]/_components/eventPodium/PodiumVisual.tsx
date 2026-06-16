import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import type { PodiumItem } from '../eventPageData'
import ListItem from './ListItem'
import PodiumBlock from './PodiumBlock'

interface Props {
  items: PodiumItem[]
  className?: string
  locale: Locale
}

const orderClasses = {
  1: 'order-1 md:order-2',
  2: 'order-2 md:order-1',
  3: 'order-3',
} as const

export default function PodiumVisual({ items, className, locale }: Props) {
  const podiumItems = items.slice(0, 3)
  const remainingItems = items.slice(3, 10)

  return (
    <>
      {/* Podium */}
      <ol
        className={twMerge(
          'mt-8 mb-12 flex min-h-80 list-none flex-col items-stretch gap-3 md:flex-row md:items-end md:justify-center md:gap-0',
          className
        )}>
        {podiumItems.map((item) => (
          <li
            key={item.rank}
            className={twMerge(
              'w-full md:flex-1',
              orderClasses[item.rank as 1 | 2 | 3]
            )}>
            <PodiumBlock locale={locale} {...item} />
          </li>
        ))}
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
