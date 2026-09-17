import ErrorPage from '@/components/layout/ErrorPage'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'

// Served outside `[locale]` (root), reached through nginx `error_page`: pin the
// default locale.
const LOCALE: Locale = 'fr'

export function generateMetadata() {
  const { t } = getServerTranslation({ locale: LOCALE })

  return getMetadataObject({
    locale: LOCALE,
    title: t('appCrash.metadata.title', 'Erreur - Nos Gestes Climat'),
    description: t(
      'appCrash.metadata.description',
      "L'application rencontre quelques difficultés en ce moment, nos équipes sont sur le coup."
    ),
    // `noIndexObject` leaves `googleBot.index` at true: harden it here.
    robots: {
      ...noIndexObject,
      googleBot: { ...noIndexObject.googleBot, index: false },
    },
  })
}

export default function AppCrash() {
  return (
    <ErrorPage illustrationSrc="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg" />
  )
}
