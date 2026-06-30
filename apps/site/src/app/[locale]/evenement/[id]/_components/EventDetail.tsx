import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

interface Props {
  locale: Locale
  imageSrc: string
}

export default async function EventDetail({ locale, imageSrc }: Props) {
  const { t } = await getServerTranslation({ locale })
  return (
    <div className="mt-6 mb-6 flex flex-row items-center gap-5">
      <div className="w-70 min-w-32">
        <Image
          src={imageSrc}
          width="300"
          height="300"
          alt={t(
            'event.detail.alt',
            'Du 18 septembre au 8 octobre, Semaine européenne du Développement Durable sur nosgestesclimat.fr'
          )}
        />
      </div>

      <div className="text-xs sm:text-base">
        <p className="text-secondary-700 mb-0 font-bold uppercase">
          <Trans locale={locale} i18nKey="event.detail.dates">
            Du 18 septembre au 8 octobre 2026
          </Trans>
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
