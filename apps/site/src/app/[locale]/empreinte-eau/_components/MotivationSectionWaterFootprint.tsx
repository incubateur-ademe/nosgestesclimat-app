import MotivationSection from '@/components/landing-pages/MotivationSection'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function MotivationSectionWaterFootprint({
  locale,
}: {
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })

  return (
    <MotivationSection
      title={t(
        'landing.carbon.motivation.title',
        "Économiser l'eau, un enjeu de développement durable"
      )}
      description={
        <p className="mb-0">
          <Trans locale={locale} i18nKey="landing.water.motivation.description">
            Avec les pressions croissantes exercées par les activités humaines
            et le changement climatique, la gestion durable de l'eau est devenue{' '}
            <strong className="text-primary-600">un défi planétaire</strong>.
            Que ce soit pour l'agriculture, l'industrie ou l'usage domestique,
            cette ressource limitée fait face à des menaces importantes.{' '}
            <strong className="text-primary-600">
              Réduire notre consommation d'eau
            </strong>{' '}
            et adopter des pratiques responsables est donc{' '}
            <strong className="text-primary-600">
              nécessaire pour préserver les ressources
            </strong>{' '}
            et répondre aux défis environnementaux mondiaux.
          </Trans>
        </p>
      }
      motivationItems={[
        {
          title: t(
            'landing.water.motivation.items.limitedRessource',
            'Ressources en eau douce limitées'
          ),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_eau_c22d6f0b6e.svg',
            alternativeText: '',
          },
          description: t(
            'landing.water.motivation.items.limitedRessource.description',
            "Bien que l'eau soit abondante sur Terre, seule 1 % de l'eau est douce et accessible pour la consommation humaine."
          ),
        },
        {
          title: t(
            'landing.water.motivation.items.pollution',
            'Pollution des eaux'
          ),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_pollution_338f41ac90.svg',
            alternativeText: '',
          },
          description: t(
            'landing.water.motivation.items.pollution.description',
            'Les pratiques agricoles intensives et les rejets industriels contaminent les ressources en eau, menacent les écosystèmes et notre santé.'
          ),
        },
        {
          title: t('landing.water.motivation.items.access', "Accès à l'eau"),
          icon: {
            url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/icone_robinet_5ac677e900.svg',
            alternativeText: '',
          },
          description: t(
            'landing.water.motivation.items.access.description',
            "Les activités humaines perturbent le cycle de l'eau et compromettent l'accès à l'eau potable, entraînant conflits, perte de biodiversité et déplacements de populations."
          ),
        },
      ]}
    />
  )
}
