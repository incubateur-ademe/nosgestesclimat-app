import ChevronLeft from '@/components/icons/ChevronLeft'
import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { PodiumItem } from '@nosgestesclimat/core/features/events/types/event-info'
import type { EventStatus } from '@nosgestesclimat/core/features/events/types/status'
import { cn } from 'cn'
import type { FilterValue } from './EventTabs'
import ListItem from './ListItem'
import PodiumBlock from './PodiumBlock'

const GENERAL_RANKING_URL =
  'https://eu.posthog.com/shared/usl5nIC6qMxcL94bJI689dnZEGPidQ'

interface Props {
  items: PodiumItem[]
  className?: string
  prevHref: string | null
  nextHref: string | null
  status: EventStatus
  activeCategoryFilter: FilterValue
}

const orderClasses: Record<number, string> = {
  1: 'order-1 md:order-2',
  2: 'order-2 md:order-1',
  3: 'order-3',
}

const ZERO_BASED_INDEX_COMPENSATION_FACTOR = 1
const RANK_COMPENSATION_FOR_AFTER_PODIUM_ITEMS = 3
const getRank = (index: number) => index + ZERO_BASED_INDEX_COMPENSATION_FACTOR

export default async function PodiumVisual({
  items,
  className,
  prevHref,
  nextHref,
  status,
  activeCategoryFilter,
}: Props) {
  const podiumItems = items.slice(0, 3)
  const remainingItems = items.slice(3, 15)

  const { t } = await getServerTranslation()

  const organisationType = {
    all: t('event.podium.empty.type.all', 'organisation'),
    companies: t('event.podium.empty.type.companies', 'entreprise'),
    associations: t('event.podium.empty.type.associations', 'association'),
    education: t('event.podium.empty.type.education', 'école ou université'),
    'public-services': t(
      'event.podium.empty.type.public-services',
      'collectivité'
    ),
  }[activeCategoryFilter]

  return (
    <>
      <div className="relative flex items-center justify-center">
        {prevHref ? (
          <ButtonLink
            href={prevHref}
            scroll={false}
            variant="outlined"
            className="absolute top-1/2 left-0 z-10 hidden h-11 w-11 -translate-y-1/2 p-0! md:flex"
            aria-label={t(
              'event.podium.previousButton.label',
              'Organisation précédente'
            )}>
            <ChevronLeft />
          </ButtonLink>
        ) : null}
        {podiumItems.length > 0 && (
          <ol
            className={cn(
              'mt-8 mb-12 flex w-full max-w-80 list-none flex-col items-stretch gap-3 md:mx-14 md:min-h-80 md:max-w-none md:flex-1 md:flex-row md:items-end md:justify-center md:gap-0 lg:mx-20',
              className
            )}>
            {podiumItems.map((item, index) => (
              <li
                key={item.name}
                className={cn(
                  'w-full md:flex-1',
                  orderClasses[getRank(index)]
                )}>
                <PodiumBlock status={status} {...item} rank={getRank(index)} />
              </li>
            ))}
          </ol>
        )}

        {podiumItems.length === 0 && (
          <p className="text-primary-700 mt-8 mb-12 flex w-full items-center justify-center px-4 text-center text-base font-medium md:min-h-80">
            {t(
              'event.podium.empty',
              "Aucune {{organisationType}} n'a participé pour le moment",
              {
                organisationType,
              }
            )}
          </p>
        )}
        {nextHref ? (
          <ButtonLink
            href={nextHref}
            scroll={false}
            variant="outlined"
            className="absolute top-1/2 right-0 z-10 hidden h-11 w-11 -translate-y-1/2 p-0! md:flex"
            aria-label={t(
              'event.podium.nextButton.label',
              'Organisation suivante'
            )}>
            <ChevronLeft className="rotate-180" />
          </ButtonLink>
        ) : null}
      </div>

      {remainingItems.length > 0 && (
        <ol
          start={4}
          aria-label={t(
            'event.podium.remainingList.ariaLabel',
            'Suite du classement'
          )}
          className={cn(
            'border-primary-600 mt-6 list-none overflow-hidden rounded-xl border',
            className
          )}>
          {remainingItems.map((item, index) => (
            <ListItem
              key={item.name}
              rank={getRank(index + RANK_COMPENSATION_FOR_AFTER_PODIUM_ITEMS)}
              {...item}
            />
          ))}
        </ol>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href={GENERAL_RANKING_URL}
          aria-label={t(
            'event.podium.generalRankingLink.ariaLabel',
            'Voir le classement général, ouvrir dans une nouvelle fenêtre'
          )}
          className="font-medium!">
          <Trans i18nKey="event.podium.generalRankingLink">
            Voir le classement général
          </Trans>
        </Link>
      </div>

      {status === 'in_progress' && (
        <p className="text-primary-700 mt-4 text-right text-sm italic">
          <Trans i18nKey="event.podium.updateNote">
            Le podium se met à jour environ toutes les 15 minutes
          </Trans>
        </p>
      )}
    </>
  )
}
