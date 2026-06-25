import type { Locale } from '@/i18nConfig'
import { getRegion } from '@/services/users/region'
import { ClientTrackers } from './ClientTrackers'

export default async function Trackers({ locale }: { locale: Locale }) {
  const regionData = await getRegion()
  return <ClientTrackers region={regionData?.current} locale={locale} />
}
