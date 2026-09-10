import UnderstandToAct from '@/components/landing-pages/UnderstandToAct'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function UnderstandToActCarbonFootprint({
  locale,
}: {
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })

  return (
    <UnderstandToAct
      locale={locale}
      description={
        <p className="mb-0">
          <Trans
            locale={locale}
            i18nKey="landing.carbon.understand.description">
            Réduire efficacement son empreinte sur l'environnement nécessite de{' '}
            <strong className="text-primary-600">
              s'informer sur les enjeux du réchauffement climatique
            </strong>
            , s'inspirer des bonnes pratiques et{' '}
            <strong className="text-primary-600">passer à l'action</strong>.
          </Trans>
        </p>
      }
      posts={[
        {
          category: t('Empreinte carbone'),
          title: t('Transports : les modes à fuir, ceux à chérir'),
          href: '/blog/mobilites/transports-fuir-transports-cherir',
          imageSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/van_bus_velo_elviss_railijs_bitans_dce5c98c2c.jpg',
        },
        {
          category: t('Empreinte carbone'),
          title: t("L'empreinte carbone : une empreinte parmi d'autres !"),
          href: '/blog/environnement/carbone-empreinte-parmi-autres',
          imageSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/markus_spiske_nature_future_0398daa4ed.jpg',
        },
        {
          category: t('Empreinte carbone'),
          title: t('Avez-vous déjà entendu parler de maladaptation ?'),
          href: '/blog/environnement/maladaptation',
          imageSrc:
            'https://s3.fr-par.scw.cloud/nosgestesclimat-prod/cms/william_bossen_fonte_glaces_a3dd8ea653.jpg',
        },
      ]}
    />
  )
}
