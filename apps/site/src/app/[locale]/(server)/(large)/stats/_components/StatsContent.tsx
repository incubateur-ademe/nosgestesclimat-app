'use client'

import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import PosthogIframe from './content/PosthogIframe'

export default function StatsContent() {
  const { t } = useClientTranslation()

  return (
    <div className="my-12">
      <Title>
        <Trans>Statistiques</Trans>
      </Title>
      <p>
        <Trans>Cette section est générée via Posthog.</Trans>
      </p>
      <PosthogIframe
        id="stats-general"
        title={t('Statistiques publiques du site Nos Gestes Climat.')}
        // TODO : update description to describe the dashboard, with actual numbers
        description={t(
          "Ce tableau de bord affiche les statistiques de fréquentation du site, incluant le nombre de visites, de simulations complétées, actions consultées. Sont inclues également des statistiques sur l'utilisation du mode Organisations, incluant le nombre d'organisations créées, de participants."
        )}
        src="https://eu.posthog.com/embedded/gbH-h--1uNS2yeIj2g2b9YwYW-bwkw"
        height="2100px"
      />
    </div>
  )
}
