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
      <div className="w-40 min-w-28">
        <Image
          src={imageSrc}
          width="160"
          height="160"
          alt={t(
            'event.detail.alt',
            '22 avril, Jour de la terre avec Nos Gestes Climat'
          )}
        />
      </div>

      <div>
        <p className="text-secondary-700 mb-0 font-bold uppercase">
          <Trans locale={locale} i18nKey="event.detail.dates">
            Du 18 septembre au 8 octobre 2026
          </Trans>
        </p>

        <p className="text-lg font-medium">
          <Trans locale={locale} i18nKey="event.detail.title">
            La Semaine du
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
