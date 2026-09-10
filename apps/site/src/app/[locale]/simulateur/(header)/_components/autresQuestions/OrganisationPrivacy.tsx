'use client'

import Trans from '@/components/translation/trans/TransClient'
import { usePollQueryParams } from '@/hooks/organisations/usePollQueryParams'
import { useClientTranslation } from '@/hooks/useClientTranslation'

export default function OrganisationPrivacy() {
  const { pollSlug } = usePollQueryParams()

  const { t } = useClientTranslation()

  // If there is no pollSlug, we don't display this section
  if (!pollSlug) {
    return null
  }

  return (
    <li className="mb-2" id={'empreinte'}>
      <details>
        <summary
          className="text-primary-700 cursor-pointer text-sm font-bold md:text-lg"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const details = e.currentTarget
                .parentElement as HTMLDetailsElement
              details.open = !details.open
            }
          }}>
          {t('Mes données restent-elles privées\u202f?')}
          <span className="sr-only">Cliquez pour afficher la réponse</span>
        </summary>
        <div className="my-2 ml-3.5">
          <p>
            <Trans>
              Vos données seront stockées de manière sécurisée et anonyme. Elles
              seront agrégées à des fins statistiques ; lesdites statistiques
              seront consultables sur la page "Rapport détaillé" de votre
              sondage en fin de parcours. Cette page restera exclusivement
              accessible aux participant·es ainsi qu'aux organisateur·ices.
            </Trans>
          </p>
        </div>
      </details>
    </li>
  )
}
