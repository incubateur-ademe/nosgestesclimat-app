'use client'

import Link from '@/components/Link'
import CountryFlag from '@/components/misc/CountryFlag'
import { LOCALISATION_BANNER_ID } from '@/constants/ids'
import { trackingClickRegionBanner } from '@/constants/tracking/misc'
import { MON_ESPACE_SETTINGS_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import {
  DEFAULT_REGION,
  type Model,
  supportedRegions,
  type UserRegion,
} from '@/helpers/server/model/models'
import { useIframe } from '@/hooks/useIframe'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { isServerSide } from '@/utils/nextjs/isServerSide'
import Trans from './trans/TransClient'

export default function LocalisationBanner({ model }: { model: Model }) {
  const { tutorials, hideTutorial } = useUser()
  const currentLocale = useLocale()
  const { iframeRegion } = useIframe()

  if ([DEFAULT_REGION, 'ED'].includes(model.region)) {
    return null
  }

  const region = model.region as UserRegion

  if (iframeRegion) return null
  const regionParams = supportedRegions[region]
  const versionName = regionParams[currentLocale].gentilé

  if (tutorials.localisationBanner || isServerSide()) return null
  if (region === DEFAULT_REGION) return null

  return (
    <Card
      tabIndex={-1}
      id={LOCALISATION_BANNER_ID}
      className="bg-primary-50 fixed right-4 bottom-12 left-4 z-50 mx-auto mb-8 flex-row sm:right-8 sm:left-auto md:bottom-0">
      <div className="flex w-full gap-4">
        <div className="w-full flex-1">
          <>
            <p className="mb-0 inline flex-1 items-baseline gap-1">
              <CountryFlag className="mr-2 inline" code={region} />
              <Trans>Vous utilisez la version</Trans>{' '}
              <strong>{versionName}</strong> <Trans>du test</Trans>.
            </p>

            <p className="mb-2">
              <span>
                {' '}
                <Trans i18nKey="components.localisation.LocalisationMessage.betaMsg">
                  Elle est actuellement en version <strong>bêta</strong>.
                </Trans>
              </span>
            </p>
          </>

          <p>
            <small>
              <Link href={MON_ESPACE_SETTINGS_PATH}>
                <Trans>Choisissez une région parmi celles disponibles !</Trans>
              </Link>
            </small>
          </p>

          <Button
            size="sm"
            className="ml-auto block"
            data-testid="understood-localisation-button"
            onClick={() => {
              hideTutorial('localisationBanner')
              trackMatomoEvent__deprecated(trackingClickRegionBanner)
            }}>
            <Trans>J'ai compris</Trans>
          </Button>
        </div>
      </div>
    </Card>
  )
}
