import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import Trans from '@/components/translation/trans/TransClient'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

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
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center md:max-h-[70vh] md:justify-center md:py-12">
        {/* `unoptimized`: nginx sert cette page pendant une panne, donc elle ne
            peut pas dépendre de l'optimiseur d'images de Next (`/_next/image`),
            qui fait partie de l'app. */}
        <Image
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg"
          width={280}
          height={280}
          alt=""
          priority
          unoptimized
        />

        <h1 className="mb-0 text-4xl font-bold tracking-tight text-balance md:text-5xl">
          <Trans>
            Face à une affluence très élevée, notre site connaît quelques
            ralentissements.
          </Trans>
        </h1>

        <p className="mb-0 max-w-xl text-lg">
          <Trans>
            Nous mettons tout en œuvre pour rétablir l'accès rapidement,
            n'hésitez pas à réessayer dans quelques minutes. Merci de votre
            patience et de votre mobilisation pour le climat !
          </Trans>
        </p>
      </main>

      {/* Sibling of `<main>`, outside its centered `max-w-6xl` column, so the
          band can span the full page width. */}
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
    </>
  )
}
