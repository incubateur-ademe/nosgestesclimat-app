import WhatDoWeMeasure from '@/components/landing-pages/WhatDoWeMeasure'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function WhatDoWeMeasureWaterFootprint({
  locale,
}: {
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })

  return (
    <WhatDoWeMeasure
      title={t(
        'landing.water.whatDoWeMeasure.title',
        "Que calcule-t-on dans l'empreinte eau ?"
      )}
      listItems={[
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_alimentation_b6c20e8522.svg',
            alternativeText: t(
              'Une pomme, symbolisant le lien entre eau et agriculture'
            ),
          },
          title: t(
            'landing.water.whatDoWeMeasure.items.fruitsLegumesCereales',
            'La culture des fruits, légumes et céréales que nous mangeons'
          ),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_textile_f789f577aa.svg',
            alternativeText: t(
              "Un tee-shirt, symbolisant la consommation d'eau pour l'industrie textile"
            ),
          },
          title: t(
            'landing.water.whatDoWeMeasure.items.textile',
            'La culture du coton de nos vêtements'
          ),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_agriculture_fe3f833cc4.svg',
            alternativeText: t('Un mouton, liant empreinte eau et élevage'),
          },
          title: t(
            'landing.water.whatDoWeMeasure.items.agriculture',
            "La production d'aliments pour les animaux d'élevage"
          ),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_ordinateur_392d915ff0.svg',
            alternativeText: t(
              "Un ordinateur, illustrant la consommation d'eau par le numérique"
            ),
          },
          title: t(
            'landing.water.whatDoWeMeasure.items.digital',
            "L'extraction des matériaux pour le numérique"
          ),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_electricite_d62b8b8914.svg',
            alternativeText: t(
              "Un éclair, symbolisant la production d'électricité"
            ),
          },
          title: t(
            'landing.water.whatDoWeMeasure.items.electricity',
            "La production d'électricité"
          ),
        },
      ]}
      description={
        <>
          <p className="mb-10 text-center">
            <Trans locale={locale}>
              L'empreinte eau,{' '}
              <strong className="text-primary-600">
                calculée en milliers de litres par jour
              </strong>
              , tient compte de{' '}
              <strong className="text-primary-600">l'eau nécessaire</strong> à
              la production, la distribution et au traitement des biens et
              services consommés. Ce calcul prend également en considération{' '}
              <strong className="text-primary-600">le stress hydrique</strong>{' '}
              et pondère les consommations d'eau en fonction de{' '}
              <strong className="text-primary-600">
                la rareté de la ressource
              </strong>{' '}
              dans les territoires concernés.
            </Trans>
          </p>

          <p className="text-secondary-700 mb-0 text-center font-bold">
            <Trans locale={locale}>
              Attention : l'empreinte eau ne tient pas compte de la consommation
              d'eau domestique (douche, toilettes, cuisine, arrosage) !
            </Trans>
          </p>
        </>
      }
    />
  )
}
