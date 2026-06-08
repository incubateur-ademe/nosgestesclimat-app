import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

interface Props {
  locale: Locale
}

export default async function EventDetail({ locale }: Props) {
  const { t } = await getServerTranslation({ locale })
  return (
    <div>
      <div>
        <Image
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/journee_de_la_terre_2026_8ead81e894.svg"
          width="160"
          height="160"
          alt={t(
            'event.detail.alt',
            '22 avril, Jour de la terre avec Nos Gestes Climat'
          )}
        />
      </div>

      <div>
        <p className="text-secondary-700 uppercase">
          <Trans locale={locale} i18nKey="event.detail.dates">
            Du 18 septembre au 8 octobre 2026
          </Trans>
        </p>

        <p>
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
