import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import type {
  EventOrganisation,
  PodiumCategory,
} from '@nosgestesclimat/core/features/events/types/event-info'
import EventTabs from './eventPodium/EventTabs'
import PodiumVisual from './eventPodium/PodiumVisual'
import { getActiveFilter } from './eventPodium/helpers/getActiveFilter'
import { getNavigationParameters } from './eventPodium/helpers/getNavigationLinks'

interface Props {
  locale: Locale
  searchParams: Promise<Record<string, string | string[] | undefined>>
  organisationsPodiumByType: Record<PodiumCategory, EventOrganisation[]>
  hasStarted: boolean
}

export default async function EventPodium({
  locale,
  searchParams,
  organisationsPodiumByType,
  hasStarted,
}: Props) {
  const params = await searchParams

  const activeFilter = getActiveFilter(params)

  const { prevHref, nextHref } = getNavigationParameters({
    params,
    activeFilter,
  })

  return (
    <div className="mb-16">
      <p className="text-secondary-700 pt-16 text-center text-base font-bold uppercase">
        <Trans i18nKey="event.podium.title" locale={locale}>
          Classement des organisations en direct
        </Trans>
      </p>

      <Title hasSeparator={false} size="xl" className="mb-12 text-center">
        <Trans i18nKey="event.podium.subtitle" locale={locale}>
          Le podium de la mobilisation
        </Trans>
      </Title>

      <EventTabs filter={activeFilter} locale={locale} params={params} />

      <PodiumVisual
        // Trigger animation on each change
        key={`podium-visual-${activeFilter}`}
        locale={locale}
        items={organisationsPodiumByType[hasStarted ? activeFilter : 'all']}
        prevHref={prevHref}
        nextHref={nextHref}
        hasStarted={hasStarted}
        activeFilter={activeFilter}
      />
    </div>
  )
}
