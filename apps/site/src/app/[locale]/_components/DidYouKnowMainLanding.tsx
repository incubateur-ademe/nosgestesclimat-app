import DidYouKnowSliderServer from '@/components/landing-pages/DidYouKnowSliderServer'
import Trans from '@/components/translation/trans/TransServer'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import { Suspense } from 'react'

export default function DidYouKnowMainLanding({
  locale,
  className,
  titleTag = 'h2',
}: {
  locale: string
  className?: string
  titleTag?: 'h2' | 'h3'
}) {
  return (
    <Suspense
      fallback={<BlockSkeleton className="my-0 h-[583px] md:h-[384px]" />}>
      <DidYouKnowSliderServer
        className={className}
        titleTag={titleTag}
        slides={[
          {
            illustration:
              'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_ordinateur_392d915ff0.svg',
            content: (
              <Trans locale={locale}>
                L'empreinte carbone moyenne d'un français est de{' '}
                <strong className="text-primary-600">
                  9,1 tonnes de CO2e par an
                </strong>
                .
              </Trans>
            ),
            highlight: <Trans locale={locale}>Et la vôtre ?</Trans>,
          },
          {
            illustration:
              'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_jeans_7373ebf3c3.svg',
            content: (
              <Trans locale={locale}>
                La production d'un jean nécessite près de{' '}
                <strong className="text-primary-600">
                  30 000 litres d'eau
                </strong>
                .
              </Trans>
            ),
            highlight: <Trans locale={locale}>Considérable, non ?</Trans>,
          },
          {
            illustration:
              'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_goutte_eau_e6a89fd5e0.svg',
            content: (
              <Trans locale={locale}>
                L'empreinte eau moyenne d'un français se compte{' '}
                <strong className="text-primary-600">
                  milliers de litres par jour
                </strong>
                .
              </Trans>
            ),
            highlight: <Trans locale={locale}>Et la vôtre ?</Trans>,
          },
          {
            illustration:
              'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_avion_39cf1c300c.svg',
            content: (
              <Trans locale={locale}>
                Un aller-retour Paris-Athènes en avion représente{' '}
                <strong className="text-primary-600">800 kg de CO2e</strong>.
              </Trans>
            ),
            highlight: <Trans locale={locale}>Impressionnant, non ?</Trans>,
          },
        ]}
      />
    </Suspense>
  )
}
