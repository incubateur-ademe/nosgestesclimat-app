import ChevronLeft from '@/components/icons/ChevronLeft'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import type { PodiumItem } from '../../_helpers/eventPageData'
import ListItem from './ListItem'
import PodiumBlock from './PodiumBlock'

interface Props {
  items: PodiumItem[]
  className?: string
  locale: Locale
  prevHref?: string
  nextHref?: string
}

const orderClasses = {
  1: 'order-1 md:order-2',
  2: 'order-2 md:order-1',
  3: 'order-3',
} as const

export default function PodiumVisual({
  items,
  className,
  locale,
  prevHref,
  nextHref,
}: Props) {
  const podiumItems = items.slice(0, 3)
  const remainingItems = items.slice(3, 10)

  return (
    <>
      <div className="relative flex items-center justify-center">
        {prevHref ? (
          <ButtonLink
            href={prevHref}
            scroll={false}
            color="secondary"
            className="absolute top-1/2 left-0 z-10 hidden h-11 w-11 -translate-y-1/2 p-0! md:flex"
            aria-label="Organisation précédente">
            <ChevronLeft />
          </ButtonLink>
        ) : null}
        <ol
          className={twMerge(
            'mt-8 mb-12 flex w-full max-w-80 list-none flex-col items-stretch gap-3 md:mx-14 md:min-h-80 md:max-w-none md:flex-1 md:flex-row md:items-end md:justify-center md:gap-0 lg:mx-20',
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
        {nextHref ? (
          <ButtonLink
            href={nextHref}
            scroll={false}
            color="secondary"
            className="absolute top-1/2 right-0 z-10 hidden h-11 w-11 -translate-y-1/2 p-0! md:flex"
            aria-label="Organisation suivante">
            <ChevronLeft className="rotate-180" />
          </ButtonLink>
        ) : null}
      </div>

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
