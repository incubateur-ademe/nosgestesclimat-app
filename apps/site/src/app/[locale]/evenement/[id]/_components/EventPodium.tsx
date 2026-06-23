import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import type { PodiumItem } from '../_helpers/eventPageData'
import type { FilterValue } from './eventPodium/EventTabs'
import EventTabs, { FILTER_KEY, FILTER_VALUES } from './eventPodium/EventTabs'
import PodiumVisual from './eventPodium/PodiumVisual'

function buildFilterHref(
  existing: Record<string, string | string[] | undefined>,
  filterValue: string
) {
  const next = new URLSearchParams()
  for (const [key, value] of Object.entries(existing)) {
    if (key === FILTER_KEY) continue
    if (Array.isArray(value)) {
      value.forEach((v) => next.append(key, v))
    } else if (value != null) {
      next.set(key, value)
    }
  }
  next.set(FILTER_KEY, filterValue)
  return `?${next.toString()}`
}

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

      <EventTabs filter={filter} locale={locale} />

      <PodiumVisual
        // Trigger animation on each change
        key={`podium-visual-${activeFilter}`}
        locale={locale}
        items={items}
        prevHref={prevHref}
        nextHref={nextHref}
        hasStarted={hasStarted}
      />
    </div>
  )
}
