import Tabs from '@/design-system/layout/Tabs'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import type { Locale } from '@/i18nConfig'

export const FILTER_KEY = 'filter'

export const FILTER_VALUES = [
  'all',
  'companies',
  'associations',
  'education',
  'public-services',
] as const
export type FilterValue = (typeof FILTER_VALUES)[number]

// Build a `?filter=value` href that preserves the other search params, so the
// tabs behave like the podium prev/next buttons.
export function buildFilterHref(
  existing: Record<string, string | string[] | undefined>,
  filterValue: string
): string {
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

const FILTER_TRANSLATIONS: Record<
  FilterValue,
  { key: string; defaultLabel: string }
> = {
  all: { key: 'event.podium.categories.all', defaultLabel: t('Toutes') },
  companies: {
    key: 'event.podium.categories.companies',
    defaultLabel: t('Entreprises'),
  },
  associations: {
    key: 'event.podium.categories.associations',
    defaultLabel: t('Associations'),
  },
  education: {
    key: 'event.podium.categories.education',
    defaultLabel: t('Éducation'),
  },
  'public-services': {
    key: 'event.podium.categories.publicServices',
    defaultLabel: t('Services publics'),
  },
}

interface Props {
  filter?: string | string[]
  locale: Locale
  params: Record<string, string | string[] | undefined>
}

export default async function EventTabs({ filter, locale, params }: Props) {
  const { t } = await getServerTranslation({ locale })

  const rawFilter = Array.isArray(filter) ? filter[0] : filter
  const activeFilter: FilterValue =
    rawFilter && FILTER_VALUES.includes(rawFilter as FilterValue)
      ? (rawFilter as FilterValue)
      : 'all'

  const items = FILTER_VALUES.map((value) => ({
    id: value,
    label: t(
      FILTER_TRANSLATIONS[value].key,
      FILTER_TRANSLATIONS[value].defaultLabel
    ),
    href: buildFilterHref(params, value),
    isActive: value === activeFilter,
    scroll: false,
  }))

  return (
    <div className="flex justify-center">
      <Tabs
        className="border-transparent [&_a]:px-3 [&_button]:px-3 [&_li]:flex-none [&_span]:px-3 [&_ul]:flex-wrap [&_ul]:justify-center"
        items={items}
      />
    </div>
  )
}
