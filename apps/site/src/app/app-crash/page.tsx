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
          Nous mettons tout en œuvre pour rétablir l'accès rapidement,
          n'hésitez pas à réessayer dans quelques minutes. Merci de votre
          patience et de votre mobilisation pour le climat !
        </Trans>
      }>
      <div className="bg-primary-100 mt-12 w-full px-4 pt-12 pb-10 text-center md:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h2 className="mb-0 text-2xl font-bold tracking-tight text-balance md:text-3xl">
            <Trans>
              Pour patienter, testez vos connaissances avec le Quiz Carbone de
              l'ADEME
            </Trans>
          </h2>

          <ImpactCO2Iframe
            type="quiz"
            locale={LOCALE}
            title="Quiz carbone - Impact CO2"
            hideButtons
            className="min-h-144 w-full max-w-xl [&_iframe]:-my-4! md:[&_iframe]:-my-8!"
          />
        </div>
      </div>
    </ErrorPage>
  )
}
