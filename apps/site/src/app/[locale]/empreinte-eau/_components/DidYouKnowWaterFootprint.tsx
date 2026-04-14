import DidYouKnowSliderServer from '@/components/landing-pages/DidYouKnowSliderServer'
import Trans from '@/components/translation/trans/TransServer'

export default function DidYouKnowWaterFootprint({
  locale,
}: {
  locale: string
}) {
  return (
    <DidYouKnowSliderServer
      slides={[
        {
          illustration:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_ordinateur_392d915ff0.svg',
          content: (
            <Trans locale={locale}>
              La production d’un ordinateur nécessite 195 000 litres d’eau.
            </Trans>
          ),
          highlight: <Trans locale={locale}>Considérable, non ?</Trans>,
        },
        {
          illustration:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_jeans_7373ebf3c3.svg',
          content: (
            <Trans locale={locale}>
              L’empreinte eau d'un jean est de 30 000 litres d'eau.
            </Trans>
          ),
          highlight: <Trans locale={locale}>Impressionnant, non ?</Trans>,
        },
        {
          illustration:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_oeuf_035042441c.svg',
          content: (
            <Trans locale={locale}>
              Il faut 75 litres d’eau pour produire un oeuf.
            </Trans>
          ),
          highlight: <Trans locale={locale}>Considérable, non ?</Trans>,
        },
      ]}
    />
  )
}
