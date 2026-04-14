'use client'

import Link from '@/components/Link'
import BookClosedIcon from '@/components/icons/BookClosedIcon'
import Trans from '@/components/translation/trans/TransClient'
import { actionsClickAdeme } from '@/constants/tracking/pages/actions'
import { captureActionsClickAdeme } from '@/constants/tracking/posthogTrackers'
import Card from '@/design-system/layout/Card'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'

export default function AllerPlusLoin() {
  const { t } = useClientTranslation()

  return (
    <Card className="bg-primary-700 mt-4 flex w-full! rounded-2xl p-8 text-left! whitespace-normal!">
      <div className="flex gap-2">
        <h2 className="flex items-center text-white">
          <BookClosedIcon aria-hidden className="mr-3 fill-white" />

          <Trans>Aller plus loin</Trans>
        </h2>
      </div>

      <div>
        <ul>
          <li>
            <Link
              className="hover:text-primary-200 block text-white underline"
              href="https://agirpourlatransition.ademe.fr/particuliers/"
              onClick={() => {
                trackMatomoEvent__deprecated(actionsClickAdeme)
                trackPosthogEvent(captureActionsClickAdeme)
              }}
              aria-label={t(
                "Découvrez les conseils de l'ADEME, ouvrir dans un nouvel onglet"
              )}>
              <Trans>Découvrez les conseils de l'ADEME</Trans>
            </Link>
          </li>
        </ul>
      </div>
    </Card>
  )
}
