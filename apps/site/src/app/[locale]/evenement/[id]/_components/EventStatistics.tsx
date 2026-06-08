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
    <div className="bg-primary-700 py-12">
      <div className="mx-auto flex w-5xl max-w-full flex-col gap-4 px-4 md:flex-row md:gap-10 md:p-0">
        <EventNumber
          value={18540}
          locale={locale}
          text={t(
            'event.statistics.first',
            "calculs d'empreinte carbone déjà réalisés"
          )}
        />

        <EventNumber
          value={56}
          locale={locale}
          text={t(
            'event.statistics.first',
            'actions disponibles pour réduire son empreinte'
          )}
        />

        <EventNumber
          value={352}
          locale={locale}
          text={
            <>
              <span>
                <Trans i18nKey="event.statistics.third.text" locale={locale}>
                  Organisations déjà mobilisées
                </Trans>

                <br />

                <Link
                  href="/"
                  className="hover:text-secondary-100 text-white transition-colors">
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
