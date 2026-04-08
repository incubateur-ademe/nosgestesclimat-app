import { getAnonSession } from '@/helpers/server/dal/anonSession'
import type { Locale } from '@/i18nConfig'
import { ClientTrackers } from './ClientTrackers'

export default async function Trackers({ locale }: { locale: Locale }) {
  const anonSession = await getAnonSession()
  return <ClientTrackers region={anonSession.region} locale={locale} />
}
