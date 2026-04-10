'use client'

import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import MetabaseIframe from './content/MetabaseIframe'

export default function StatsContent() {
  const { t } = useClientTranslation()

  return (
    <div className="my-12">
      <Title>
        <Trans>Statistiques</Trans>
      </Title>

      {/* Section Visites et simulations */}
      <section className="mt-8" aria-labelledby="visites-simulations-heading">
        <h2 id="visites-simulations-heading">
          <Trans>Visites et simulations</Trans>
        </h2>
        <MetabaseIframe
          id="stats-general"
          title={t(
            'Graphiques du nombre de visites et de simulations sur le site'
          )}
          // TODO : update description to describe the dashboard, with actual numbers
          description={t(
            "Ce tableau de bord affiche les statistiques de fréquentation du site, incluant le nombre de visites, de simulations complétées, et les tendances d'utilisation."
          )}
          src="https://metabase.nosgestesclimat.fr/public/dashboard/b69428fd-f60f-478a-b3b1-0d0e98d64547#titled=false"
          height="1050px"
        />
      </section>

      {/* Section Données qualitatives */}
      <section aria-labelledby="donnees-qualitatives-heading" className="mt-8">
        <h2 id="donnees-qualitatives-heading">
          <Trans>Données qualitatives</Trans>
        </h2>
        <MetabaseIframe
          id="stats-quali"
          title={t(
            'Graphique de distribution des résultats de simulation pour le mois dernier'
          )}
          // TODO : update description to describe the dashboard, with actual numbers
          description={t(
            "Ce graphique présente la distribution des résultats de simulation des utilisateurs, permettant d'analyser les tendances et les comportements."
          )}
          src="https://metabase.nosgestesclimat.fr/public/dashboard/1ca406e9-7366-4cc2-8930-50b8f9fde77d#titled=false"
          height="500px"
        />
      </section>

      {/* Section Modes Groupes */}
      <section aria-labelledby="modes-groupes-heading" className="mt-8">
        <h2 id="modes-groupes-heading">
          <Trans>Modes "Groupes"</Trans>
        </h2>
        <p>
          <Trans>
            Il est question ici des modes "Organisations" et "Challenge tes
            amis". Cette section est générée via Metabase.
          </Trans>
        </p>

        {/* Sous-section Organisations */}
        <article className="mb-8" aria-labelledby="organisations-heading">
          <h3 id="organisations-heading">Mode "Organisations"</h3>
          <MetabaseIframe
            id="stats-orga"
            title={t('Statistiques d\'usage du mode "Organisations"')}
            // TODO : update description to describe the dashboard, with actual numbers
            description={t(
              "Statistiques détaillées sur l'utilisation du mode Organisations, incluant le nombre d'organisations créées, de participants, et d'actions réalisées."
            )}
            src="https://metabase.nosgestesclimat.fr/public/dashboard/fd7c7f21-460a-44bb-865d-ceb72f3eafe2#titled=false"
            height="500px"
          />
        </article>

        {/* Sous-section Challenge */}
        <article aria-labelledby="challenge-heading" className="mt-4">
          <h3 id="challenge-heading">Mode "Challenge tes amis"</h3>
          <MetabaseIframe
            id="stats-amis"
            title={t('Statistiques d\'usage du mode "Challenge tes amis"')}
            // TODO : update description to describe the dashboard, with actual numbers
            description={t(
              "Statistiques sur l'utilisation du mode Challenge, incluant le nombre de défis créés, de participants, et de résultats partagés."
            )}
            src="https://metabase.nosgestesclimat.fr/public/dashboard/73de06cd-a637-470b-a8a7-3ed86a06da4a#titled=false"
            height="500px"
          />
        </article>
      </section>
    </div>
  )
}
