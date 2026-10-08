import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { EventStatus } from '../_types/event'
import EventNumber from './eventStatistics/EventNumber'

interface Props {
  locale: Locale
  status: EventStatus
  values: {
    simulations: number
    actions: number
    organisations: number
  }
}

export default function EventStatistics({ locale, status, values }: Props) {
  const { t } = getServerTranslation({ locale })
  const isEventInProgress = status === 'inProgress'
  return (
    <div className="bg-primary-700 py-12">
      <div className="mx-auto flex w-5xl max-w-full flex-col px-4 lg:p-0">
        {status === 'notStarted' && (
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
            text={
              isEventInProgress
                ? t(
                    'event.statistics.first.inProgress',
                    "calculs d'empreinte carbone déjà réalisés"
                  )
                : t(
                    'event.statistics.first.ended',
                    "calculs d'empreinte carbone réalisés"
                  )
            }
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
                  {isEventInProgress ? (
                    <Trans
                      i18nKey="event.statistics.third.text.inProgress"
                      locale={locale}>
                      Organisations déjà mobilisées
                    </Trans>
                  ) : (
                    <Trans
                      i18nKey="event.statistics.third.text.ended"
                      locale={locale}>
                      Organisations mobilisées
                    </Trans>
                  )}

                  <br />

                  {isEventInProgress && (
                    <Link
                      href="/organisations"
                      className="hover:text-secondary-100 text-white transition-colors">
                      <Trans
                        i18nKey="event.statistics.third.link"
                        locale={locale}>
                        Rejoignez-les !
                      </Trans>
                    </Link>
                  )}
                </span>
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
