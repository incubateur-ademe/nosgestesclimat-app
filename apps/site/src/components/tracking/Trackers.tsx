import { getUserRegion } from '@/services/users/region'
import type { Locale } from '@/i18nConfig'
import { ClientTrackers } from './ClientTrackers'

export default async function Trackers({ locale }: { locale: Locale }) {
  const region = await getUserRegion()
  return <ClientTrackers region={region} locale={locale} />
}
