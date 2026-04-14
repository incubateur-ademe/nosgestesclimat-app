import WhatDoWeMeasure from '@/components/landing-pages/WhatDoWeMeasure'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function WhatDoWeMeasureCarbon({
  locale,
}: {
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })
  return (
    <WhatDoWeMeasure
      title={<Trans locale={locale}>Calculer son empreinte carbone</Trans>}
      description={
        <p className="mb-0 text-center">
          <Trans locale={locale}>
            Le calculateur carbone permet de comprendre quels sont nos usages
            qui contribuent le plus au changement climatique et de saisir{' '}
            <strong className="text-primary-600">
              les actions qui auraient le plus d'impact
            </strong>{' '}
            pour le réduire.
          </Trans>
        </p>
      }
      shouldDescriptionBeBeforeList
      shouldUseDescriptionMaxWidth
      listItems={[
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_velo_0b190d715c.svg',
            alternativeText: '',
          },
          title: t('landing.carbon.measure.modes', 'Vos modes de déplacement'),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_viande_b8d5c03c9b.svg',
            alternativeText: '',
          },
          title: t('landing.carbon.measure.food', 'Votre régime alimentaire'),
        },
        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_bois_aa65836769.svg',
            alternativeText: '',
          },
          title: t(
            'landing.carbon.measure.energy',
            'Vos consommations énergétiques'
          ),
        },

        {
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_ordinateur_392d915ff0.svg',
            alternativeText: '',
          },
          title: t('landing.carbon.measure.shopping', 'Vos achats'),
        },
      ]}
    />
  )
}
