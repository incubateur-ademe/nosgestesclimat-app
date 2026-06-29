import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import EventNumber from './eventStatistics/EventNumber'

interface Props {
  locale: Locale
  hasStarted: boolean
  values: {
    simulations: number
    actions: number
    organisations: number
  }
}

export default async function EventStatistics({
  locale,
  hasStarted,
  values,
}: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="bg-primary-700 py-12">
      <div className="mx-auto flex w-5xl max-w-full flex-col px-4 lg:p-0">
        {!hasStarted && (
          <p className="mb-6 text-center text-sm font-bold tracking-wide text-white uppercase">
            <Trans i18nKey="event.statistics.title" locale={locale}>
              Les données en direct apparaîtront au lancement
            </Trans>
          </p>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:gap-10">
          <EventNumber
            value={values.simulations}
            locale={locale}
            text={t(
              'event.statistics.first',
              "calculs d'empreinte carbone déjà réalisés"
            )}
          />

          <EventNumber
            value={values.actions}
            locale={locale}
            text={t(
              'event.statistics.second',
              'actions disponibles pour réduire son empreinte'
            )}
          />

          <EventNumber
            value={values.organisations}
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
                    <Trans
                      i18nKey="event.statistics.third.link"
                      locale={locale}>
                      Rejoignez-les !
                    </Trans>
                  </Link>
                </span>
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
