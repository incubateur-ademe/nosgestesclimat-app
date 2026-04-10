'use client'

import Link from '@/components/Link'
import CountryFlag from '@/components/misc/CountryFlag'
import { LOCALISATION_BANNER_ID } from '@/constants/ids'
import { defaultModelRegionCode } from '@/constants/localisation/translation'
import { trackingClickRegionBanner } from '@/constants/tracking/misc'
import {
  MON_ESPACE_SETTINGS_PATH,
  SIMULATOR_PATH,
} from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import { useIframe } from '@/hooks/useIframe'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { capitalizeString } from '@/utils/capitalizeString'
import type { SupportedRegions } from '@incubateur-ademe/nosgestesclimat'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import Trans from './trans/TransClient'

interface Props {
  supportedRegions: SupportedRegions
}
export default function LocalisationBanner({ supportedRegions }: Props) {
  const { user, tutorials, hideTutorial } = useUser()

  const pathname = usePathname()

  const isTutorialOrTest =
    pathname.includes('/tutoriel') || pathname.startsWith(SIMULATOR_PATH)

  const currentLocale = useLocale()

  const region = user?.region
  const code = user?.region?.code ?? 'FR'

  const { iframeRegion } = useIframe()

  if (iframeRegion) return null

  if (!supportedRegions) return null

  const regionParams = supportedRegions?.[code]

  const countryName =
    capitalizeString(regionParams?.[currentLocale]?.nom) || region?.name

  const versionName: string = regionParams
    ? (regionParams?.[currentLocale]?.['gentilé'] ??
      regionParams?.[currentLocale]?.nom ??
      '')
    : (countryName ?? '')

  if (tutorials.localisationBanner) return null

  if (!code || code === defaultModelRegionCode) return null

  if (pathname === MON_ESPACE_SETTINGS_PATH) return null

  return (
    <Card
      tabIndex={-1}
      id={LOCALISATION_BANNER_ID}
      className={twMerge(
        'bg-primary-50 fixed right-4 bottom-10 left-4 z-50 mx-auto mb-8 flex-row sm:right-8 sm:left-auto md:bottom-0',
        isTutorialOrTest && 'bottom-12'
      )}>
      <div className="flex w-full gap-4">
        <div className="w-full flex-1">
          {regionParams && (
            <>
              <p className="mb-0 inline flex-1 items-baseline gap-1">
                <CountryFlag className="mr-2 inline" code={code} />
                <Trans>Vous utilisez la version</Trans>{' '}
                <strong>{versionName}</strong> <Trans>du test</Trans>.
              </p>

              <p className="mb-2">
                {code !== defaultModelRegionCode && (
                  <span>
                    {' '}
                    <Trans i18nKey="components.localisation.LocalisationMessage.betaMsg">
                      Elle est actuellement en version <strong>bêta</strong>.
                    </Trans>
                  </span>
                )}{' '}
              </p>
            </>
          )}

          {!regionParams && code && (
            <section>
              <p>
                <Trans>
                  Nous avons détecté que vous faites cette simulation depuis
                </Trans>{' '}
                {countryName} <CountryFlag code={code} className="inline" />.
              </p>

              <p className="mt-2">
                <b>
                  <Trans i18nKey="components.localisation.LocalisationMessage.warnMessage">
                    Votre région n'est pas encore supportée, le modèle Français
                    vous est proposé par défaut
                  </Trans>
                </b>{' '}
                <CountryFlag code={defaultModelRegionCode} className="inline" />
                <b>.</b>
              </p>
            </section>
          )}

          {!regionParams && !code && (
            <p className="mb-0">
              <Trans i18nKey="components.localisation.LocalisationMessage.warnMessage2">
                Nous n'avons pas pu détecter votre pays de simulation, le modèle
                Français vous est proposé par défaut
              </Trans>{' '}
              <CountryFlag code={defaultModelRegionCode} className="inline" />.
            </p>
          )}

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
