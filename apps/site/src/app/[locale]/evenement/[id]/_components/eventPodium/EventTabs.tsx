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

const FILTER_TRANSLATIONS: Record<
  FilterValue,
  { key: string; defaultLabel: string }
> = {
  all: { key: 'event.podium.categories.all', defaultLabel: 'Toutes' },
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
}

export default async function EventTabs({ filter, locale }: Props) {
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
    href: `?${FILTER_KEY}=${value}`,
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
