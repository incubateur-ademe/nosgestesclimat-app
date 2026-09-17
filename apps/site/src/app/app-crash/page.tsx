import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import ErrorPage from '@/components/layout/ErrorPage'
import Trans from '@/components/translation/trans/TransClient'
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
      'Le site connaît une forte affluence, nos équipes travaillent à rétablir l’accès.'
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
    <ErrorPage
      illustrationSrc="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg"
      title={
        <Trans>
          Face à une affluence très élevée, notre site connaît quelques
          ralentissements.
        </Trans>
      }
      description={
        <Trans>
          Nous mettons tout en œuvre pour rétablir l'accès rapidement.
          <br />
          Merci pour votre patience et votre mobilisation pour le climat !
        </Trans>
      }>
      <div className="mt-12 w-full max-w-xl border-t border-gray-200 pt-12">
        <h2 className="text-lg font-bold md:text-xl">
          <Trans>
            Pour patienter, vous pouvez tester vos connaissances avec le
            quizz carbone de l'ADEME
          </Trans>
        </h2>

        <ImpactCO2Iframe
          type="quiz"
          locale={LOCALE}
          title="Quiz carbone - Impact CO2"
          hideButtons
          className="mt-6 min-h-144 [&_iframe]:-my-4! md:[&_iframe]:-my-8!"
        />
      </div>
    </ErrorPage>
  )
}
