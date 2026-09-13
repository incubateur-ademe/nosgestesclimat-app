import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

interface Props {
  locale: Locale
  imageSrc: string
  startDate: Date
  endDate: Date
}

export default function EventDetail({
  locale,
  imageSrc,
  startDate,
  endDate,
}: Props) {
  const { t } = getServerTranslation({ locale })

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-GB'

  const sameYear = startDate.getFullYear() === endDate.getFullYear()

  const startDateLabel = startDate.toLocaleDateString(dateLocale, {
    timeZone: 'Europe/Paris',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endDateLabel = endDate.toLocaleDateString(dateLocale, {
    timeZone: 'Europe/Paris',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mt-6 mb-6 flex flex-row items-center gap-5">
      <div className="w-70 min-w-32">
        <Image
          src={imageSrc}
          width="300"
          height="300"
          alt={t(
            'event.detail.alt',
            'Du {{startDate}} au {{endDate}}, Semaine européenne du Développement Durable sur nosgestesclimat.fr',
            { startDate: startDateLabel, endDate: endDateLabel }
          )}
        />
      </div>

      <div className="text-xs sm:text-base">
        <p className="text-secondary-700 mb-0 font-bold uppercase">
          {t('event.detail.dates', 'Du {{startDate}} au {{endDate}}', {
            startDate: startDateLabel,
            endDate: endDateLabel,
          })}
        </p>

        <p className="font-medium sm:text-lg">
          <Trans locale={locale} i18nKey="event.detail.title">
            Semaine Européenne du
            <br />
            Développement
            <br />
            Durable
          </Trans>
        </p>
      </div>
    </div>
  )
}
