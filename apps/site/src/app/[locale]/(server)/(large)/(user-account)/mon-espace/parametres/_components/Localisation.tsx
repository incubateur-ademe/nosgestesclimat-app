'use client'

import FlagIcon from '@/components/icons/FlagIcon'
import CountryFlag from '@/components/misc/CountryFlag'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIframe } from '@/hooks/useIframe'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/publicodes-state'
import type { SupportedRegions } from '@incubateur-ademe/nosgestesclimat'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import RegionModelAuthors from './localisation/RegionModelAuthors'
import RegionSelector from './localisation/RegionSelector'

export default function Localisation() {
  const { t } = useClientTranslation()
  const locale = useLocale()

  const { user, updateRegion, tutorials, showTutorial } = useUser()
  const { region, initialRegion } = user

  const isRegionSupported = Object.keys(supportedRegions).some(
    (supportedRegion: string) => supportedRegion === region?.code
  )

  const { isIframe } = useIframe()

  if (isIframe) return null

  return (
    <div className="mt-4 mb-8 sm:mt-8">
      <h2 id="answers" className="flex items-center">
        <FlagIcon className="fill-primary-700 mr-3" aria-hidden />

        <span>
          <Trans>Ma région de simulation</Trans>
        </span>
      </h2>
      {region?.code && (
        <div className="my-4">
          <p className="mb-0">
            <Trans>Vous faites cette simulation depuis :</Trans>{' '}
            <strong>{region.name}</strong>
            <CountryFlag code={region.code} className="ml-2 inline-block" />.
          </p>
          {!isRegionSupported && (
            <>
              {t('components.localisation.Localisation.warnMessage', {
                countryName: region.name,
              })}
            </>
          )}

          <div className="flex flex-wrap items-baseline gap-2 sm:flex-nowrap">
            {initialRegion && region.code !== initialRegion.code && (
              <div className="mt-2">
                <Button
                  color="text"
                  size="sm"
                  onClick={() => {
                    updateRegion(initialRegion)
                    if (tutorials.localisationBanner) {
                      showTutorial('localisationBanner')
                    }
                  }}>
                  <Trans>Revenir à ma région par défaut </Trans>{' '}
                  <span aria-label={initialRegion.name}>
                    <CountryFlag
                      code={initialRegion.code}
                      className="ml-2 inline-block"
                    />
                  </span>
                </Button>
              </div>
            )}
            {isRegionSupported && (
              <RegionModelAuthors
                authors={
                  (supportedRegions as SupportedRegions)[region.code][locale]
                    .authors
                }
              />
            )}
          </div>
        </div>
      )}

      {!region && (
        <p>
          <Trans i18nKey="components.localisation.Localisation.warnMessage2">
            Nous n'avons pas pu détecter votre pays de simulation, le modèle
            Français vous est proposé par défaut.
          </Trans>
        </p>
      )}
      <RegionSelector supportedRegions={supportedRegions} />
    </div>
  )
}
