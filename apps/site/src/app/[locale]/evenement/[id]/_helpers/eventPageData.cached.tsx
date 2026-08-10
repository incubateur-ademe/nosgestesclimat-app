import type { Locale } from '@/i18nConfig'
import { cacheLife } from 'next/cache'
import {
  getEventPageData as getEventPageDataUncached,
  type EventPageData,
} from './eventPageData'

// Production-only wrapper: 'use cache' keeps the event page out of the
// database for up to 10 minutes. Preview apps and local development use the
// uncached version so test participations appear immediately.
export async function getEventPageData({
  eventId,
  locale,
}: {
  eventId: string
  locale: Locale
}): Promise<EventPageData | null> {
  'use cache'
  cacheLife({ stale: 600, revalidate: 600, expire: 600 })

  return await getEventPageDataUncached({ eventId, locale })
}
