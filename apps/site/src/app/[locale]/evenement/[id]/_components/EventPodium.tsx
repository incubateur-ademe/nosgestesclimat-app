import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import type { SearchParams } from 'next/dist/server/request/search-params'
import type { PodiumItem } from '../_helpers/eventPageData'
import EventTabs, { FILTER_KEY } from './eventPodium/EventTabs'
import PodiumVisual from './eventPodium/PodiumVisual'

interface Props {
  locale: Locale
  searchParams: Promise<SearchParams>
  items: PodiumItem[]
}

export default async function EventPodium({
  locale,
  searchParams,
  items,
}: Props) {
  const { [FILTER_KEY]: filter } = await searchParams
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

      <PodiumVisual locale={locale} items={items} />
    </div>
  )
}
