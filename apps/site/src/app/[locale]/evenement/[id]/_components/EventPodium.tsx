import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import type { SearchParams } from 'next/dist/server/request/search-params'
import EventTabs, { FILTER_KEY } from './eventPodium/EventTabs'
import PodiumVisual from './eventPodium/PodiumVisual'

interface Props {
  locale: Locale
  searchParams: Promise<SearchParams>
}

const PLACEHOLDER_DATA = [
  {
    rank: 1,
    label: 'Votre organisation ?',
    score: 0,
  },
  {
    rank: 2,
    label: 'Organisation concurrente',
    score: 0,
  },
  {
    rank: 3,
    label: 'Organisation concurrente',
    score: 0,
  },
  { rank: 4, label: 'Organisation concurrente', score: 0 },
  { rank: 5, label: 'Organisation concurrente', score: 0 },
  { rank: 6, label: 'Organisation concurrente', score: 0 },
  { rank: 7, label: 'Organisation concurrente', score: 0 },
  { rank: 8, label: 'Organisation concurrente', score: 0 },
  { rank: 9, label: 'Organisation concurrente', score: 0 },
  { rank: 10, label: 'Organisation concurrente', score: 0 },
]

export default async function EventPodium({ locale, searchParams }: Props) {
  const { [FILTER_KEY]: filter } = await searchParams
  return (
    <>
      <p className="text-secondary-700 pt-16 text-center text-base font-bold uppercase">
        <Trans i18nKey="event.podium.subtitle" locale={locale}>
          Classement des organisations en direct
        </Trans>
      </p>

      <Title hasSeparator={false} size="xl" className="mb-12 text-center">
        <Trans i18nKey="event.podium.subtitle" locale={locale}>
          Le podium de la mobilisation{' '}
        </Trans>
      </Title>

      <EventTabs filter={filter} locale={locale} />

      <PodiumVisual locale={locale} items={PLACEHOLDER_DATA} />
    </>
  )
}
