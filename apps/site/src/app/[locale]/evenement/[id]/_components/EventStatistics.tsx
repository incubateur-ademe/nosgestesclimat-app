import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import EventNumber from './eventStatistics/EventNumber'

interface Props {
  locale: Locale
}

export default async function EventStatistics({ locale }: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-10">
        <EventNumber
          value="18 540"
          text={t(
            'event.statistics.first',
            "calculs d'empreinte carbone déjà réalisés"
          )}
        />

        <EventNumber
          value="18 540"
          text={t(
            'event.statistics.first',
            "calculs d'empreinte carbone déjà réalisés"
          )}
        />

        <EventNumber
          value="56"
          text={t(
            'event.statistics.first',
            'actions disponibles pour réduire son empreinte'
          )}
        />

        <EventNumber
          value="352"
          text={
            <>
              <span>
                <Trans i18nKey="event.statistics.third.text" locale={locale}>
                  Organisations déjà mobilisées
                </Trans>

                <Link href="/">
                  <Trans i18nKey="event.statistics.third.link" locale={locale}>
                    Rejoignez-les !
                  </Trans>
                </Link>
              </span>
            </>
          }
        />
      </div>
    </div>
  )
}
