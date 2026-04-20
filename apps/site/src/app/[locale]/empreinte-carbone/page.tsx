import CTAButtons from '@/components/cta/CTAButtons'

import Partners from '@/components/landing-pages/Partners'
import Footer from '@/components/layout/Footer'
import JSONLD from '@/components/seo/JSONLD'
import Trans from '@/components/translation/trans/TransServer'
import LandingPage from '@/design-system/layout/LandingPage'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUser } from '@/helpers/server/dal/user'
import type { DefaultPageProps } from '@/types'
import Image from 'next/image'
import { ClientLayout } from '../../../components/layout/ClientLayout'
import DailyGestureCarbonFootprint from './_components/DailyGestureCarbonFootprint'
import DidYouKnowCarbon from './_components/DidYouKnowCarbonFootprint'
import FAQCarbonFootprint from './_components/FAQCarbonFootprint'
import MotivationSectionCarbonFootprint from './_components/MotivationSectionCarbonFootprint'
import UnderstandToActCarbonFootprint from './_components/UnderstandToActCarbonFootprint'
import WhatDoWeMeasureCarbon from './_components/WhatDoWeMeasureCarbonFootprint'
import WhatItIsCarbon from './_components/WhatItIsCarbon'
import { carbonFAQJsonLd } from './_constants/carbonFAQJsonLd'

export const generateMetadata = getCommonMetadata({
  title: t(
    'Empreinte carbone : comprendre, mesurer, réduire son impact - Nos Gestes Climat'
  ),
  description: t(
    'Informez-vous sur l’empreinte carbone, de sa définition aux actions les plus impactantes pour réduire ses émissions et enclencher sa transition écologique'
  ),
  alternates: {
    canonical: '/empreinte-carbone',
  },
})

export default async function CarbonFootprintLandingPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const { id: serverUserId } = await getUser()
  return (
    <ClientLayout serverUserId={serverUserId} locale={locale}>
      <JSONLD
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            url: 'https://nosgestesclimat.fr',
            name: 'Nos Gestes Climat',
            logo: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: carbonFAQJsonLd.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />

      <LandingPage
        locale={locale}
        heroTitle={
          <Trans i18nKey="empreinte-carbone.heroTitle" locale={locale}>
            L'empreinte carbone, une première étape pour passer à l'action
          </Trans>
        }
        heroDescription={
          <div className="flex flex-col items-start gap-4 md:gap-6">
            <p className="mb-0">
              <Trans locale={locale}>
                Calculez votre{' '}
                <strong className="text-primary-600">empreinte carbone</strong>{' '}
                en quelques minutes et découvrez les{' '}
                <strong className="text-primary-600">actions</strong> les plus
                efficaces pour{' '}
                <strong className="text-primary-600">
                  réduire vos émissions
                </strong>{' '}
                de gaz à effet de serre.
              </Trans>
            </p>
            <div className="flex w-full justify-center md:justify-start">
              <CTAButtons locale={locale} />
            </div>

            <div className="mx-auto mt-4 max-w-80 md:mt-0 md:hidden">
              <Image
                width={280}
                height={280}
                src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg"
                alt=""
              />
            </div>
          </div>
        }
        heroIllustration={
          <div className="hidden md:block">
            <Image
              width={400}
              height={400}
              src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg"
              alt=""
            />
          </div>
        }
        heroPartners={<Partners locale={locale} />}>
        <WhatItIsCarbon locale={locale} />

        <WhatDoWeMeasureCarbon locale={locale} />

        <DidYouKnowCarbon locale={locale} />

        <DailyGestureCarbonFootprint locale={locale} />

        <UnderstandToActCarbonFootprint
          locale={locale}
          pathname={'/empreinte-carbone'}
        />

        <MotivationSectionCarbonFootprint locale={locale} />

        <FAQCarbonFootprint locale={locale} />
      </LandingPage>

      <Footer backgroundColor="white" locale={locale} />
    </ClientLayout>
  )
}
