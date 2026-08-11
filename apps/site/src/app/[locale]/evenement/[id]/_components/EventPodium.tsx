import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import { filterAndRankPodiumItems } from '@nosgestesclimat/core/features/events/helpers/podium'
import type { PodiumItem } from '@nosgestesclimat/core/features/events/types/podium'
import type { FilterValue } from './eventPodium/EventTabs'
import EventTabs, {
  FILTER_KEY,
  FILTER_VALUES,
  buildFilterHref,
} from './eventPodium/EventTabs'
import PodiumVisual from './eventPodium/PodiumVisual'

interface Props {
  locale: Locale
  searchParams: Promise<Record<string, string | string[] | undefined>>
  items: PodiumItem[]
  hasStarted: boolean
}

export default async function EventPodium({
  locale,
  searchParams,
  items,
  hasStarted,
}: Props) {
  const params = await searchParams
  const filter = params[FILTER_KEY]

  const rawFilter = Array.isArray(filter) ? filter[0] : filter
  const activeFilter: FilterValue =
    rawFilter && (FILTER_VALUES as readonly string[]).includes(rawFilter)
      ? (rawFilter as FilterValue)
      : 'all'

  const activeIndex = FILTER_VALUES.indexOf(activeFilter)
  const prevFilter =
    activeIndex > 0 ? FILTER_VALUES[activeIndex - 1] : undefined
  const nextFilter =
    activeIndex < FILTER_VALUES.length - 1
      ? FILTER_VALUES[activeIndex + 1]
      : undefined

  const prevHref = prevFilter ? buildFilterHref(params, prevFilter) : undefined
  const nextHref = nextFilter ? buildFilterHref(params, nextFilter) : undefined

  // Before the event starts, all tabs show the same placeholder list.
  const filteredItems = filterAndRankPodiumItems(
    items,
    hasStarted ? activeFilter : 'all'
  )

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

      <EventTabs filter={filter} locale={locale} params={params} />

      <PodiumVisual
        // Trigger animation on each change
        key={`podium-visual-${activeFilter}`}
        locale={locale}
        items={filteredItems}
        prevHref={prevHref}
        nextHref={nextHref}
        hasStarted={hasStarted}
        activeFilter={activeFilter}
      />
    </div>
  )
}
