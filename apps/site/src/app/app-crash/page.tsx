import ErrorPage from '@/components/layout/ErrorPage'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'

// Page servie hors `[locale]` (racine) et mise en cache par nginx : on fixe la
// locale par défaut.
const LOCALE: Locale = 'fr'

export async function generateMetadata() {
  const { t } = await getServerTranslation({ locale: LOCALE })

  return getMetadataObject({
    locale: LOCALE,
    title: t('appCrash.metadata.title', 'Erreur - Nos Gestes Climat'),
    description: t(
      'appCrash.metadata.description',
      "L'application rencontre quelques difficultés en ce moment, nos équipes sont sur le coup."
    ),
    // Page technique : jamais destinée aux robots d'indexation.
    // On durcit `noIndexObject` pour Googlebot, qu'il laisse indexer par défaut.
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
