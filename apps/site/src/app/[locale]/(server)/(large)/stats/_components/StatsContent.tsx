'use client'

import Trans from '@/components/translation/trans/TransClient'
import InlineLink from '@/design-system/inputs/InlineLink'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import PosthogIframe from './content/PosthogIframe'

export default function StatsContent() {
  const { t } = useClientTranslation()

  return (
    <div className="mb-24">
      <Title size="xl">
        <Trans i18nKey="stats.title">Statistiques</Trans>
      </Title>
      <p>
        <Trans i18nKey="stats.description">
          Cette section est générée via Posthog.
        </Trans>
      </p>
      <PosthogIframe
        id="stats-general"
        title={t(
          'stats.iframe.title',
          'Statistiques publiques du site Nos Gestes Climat.'
        )}
        // TODO : update description to describe the dashboard, with actual numbers
        description={t(
          'stats.iframe.description',
          "Ce tableau de bord affiche les statistiques de fréquentation du site, incluant le nombre de visites, de simulations complétées, actions consultées. Sont inclues également des statistiques sur l'utilisation du mode Organisations, incluant le nombre d'organisations créées, de participants."
        )}
        src="https://eu.posthog.com/embedded/gbH-h--1uNS2yeIj2g2b9YwYW-bwkw"
        height="2100px"
      />

      <Title tag="h2" size="lg" className="mt-10">
        <Trans i18nKey="stats.impact_matrix.title">Matrice d'impact</Trans>
      </Title>
      <p>
        <Trans i18nKey="stats.impact_matrix.description">
          Consultez notre{' '}
          <InlineLink href="/matrice-impact">matrice d'impact</InlineLink> afin
          de prendre connaissance de{' '}
          <strong>nos indicateurs d’usage et d’impact</strong>.
        </Trans>
      </p>
    </div>
  )
}
