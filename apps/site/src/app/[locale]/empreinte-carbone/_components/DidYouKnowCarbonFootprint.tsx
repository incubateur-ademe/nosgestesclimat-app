import DidYouKnowSliderServer from '@/components/landing-pages/DidYouKnowSliderServer'
import Trans from '@/components/translation/trans/TransServer'

export default function DidYouKnowCarbon({ locale }: { locale: string }) {
  return (
    <DidYouKnowSliderServer
      slides={[
        {
          illustration:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_trophee_32ee5f6d9a.svg',
          content: (
            <Trans locale={locale}>
              L'empreinte carbone moyenne d'un français est de{' '}
              <strong className="text-primary-600">
                9 tonnes de CO2e par an
              </strong>
              . Objectif 2050 : 2 tonnes !
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
  )
}
