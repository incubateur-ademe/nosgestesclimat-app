import MotivationSection from '@/components/landing-pages/MotivationSection'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function MotivationSectionCarbonFootprint({
  locale,
}: {
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })
  return (
    <MotivationSection
      title={t(
        'landing.carbon.motivation.title',
        'Accélérons la transition écologique'
      )}
      description={
        <p className="mb-0">
          <Trans
            locale={locale}
            i18nKey="landing.carbon.motivation.description">
            Il est urgent de réduire nos émissions de gaz à effet de serre et
            d'opérer une transition vers des modes de vie bas-carbone. Individus
            et organisations, il est temps d'agir :{' '}
            <strong className="text-primary-600">
              mesurer son empreinte carbone est la première étape !
            </strong>
          </Trans>
        </p>
      }
      motivationItems={[
        {
          title: t(
            'landing.carbon.motivation.items.passTest',
            'Passer le test'
          ),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_calculatrice_59c4502e6f.svg',
            alternativeText: '',
          },
          description: t(
            'landing.carbon.motivation.items.passTest.description',
            "Évaluer son empreinte écologique (carbone et eau) pour identifier les principaux leviers d'action."
          ),
        },
        {
          title: t(
            'landing.carbon.motivation.items.actDaily',
            'Agir au quotidien'
          ),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_biceps_37c35c3709.svg',
            alternativeText: '',
          },
          description: t(
            'landing.carbon.motivation.items.actDaily.description',
            "Découvrir quelles actions ont le plus d'impact pour réduire son empreinte carbone."
          ),
        },
        {
          title: t(
            'landing.carbon.motivation.items.collectiveEngagement',
            "S'engager collectivement"
          ),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_poignee_de_main_8a9e5792cb.svg',
            alternativeText: '',
          },
          description: t(
            'landing.carbon.motivation.items.collectiveEngagement.description',
            'Les challenges entre amis ou la diffusion des outils en entreprise permettent de mobiliser votre entourage.'
          ),
        },
      ]}
    />
  )
}
