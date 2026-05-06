'use client'

import FlagIcon from '@/components/icons/FlagIcon'
import CountryFlag from '@/components/misc/CountryFlag'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import {
  supportedRegions,
  type UserRegion,
} from '@/helpers/server/model/models'
import { useIframe } from '@/hooks/useIframe'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/publicodes-state'
import RegionModelAuthors from './localisation/RegionModelAuthors'
import RegionSelector from './localisation/RegionSelector'

export default function Localisation({
  updateRegionAction: updateRegion,
  initialRegion,
  region,
}: {
  updateRegionAction: (code: UserRegion) => Promise<void>
  initialRegion: UserRegion
  region: UserRegion
}) {
  const locale = useLocale()

  const { tutorials, showTutorial } = useUser()

  const { isIframe } = useIframe()
  if (isIframe) return null

  async function resetRegion() {
    await updateRegion(initialRegion)
    if (tutorials.localisationBanner) {
      showTutorial('localisationBanner')
    }
  }
  const regionObj = supportedRegions[region][locale]
  return (
    <div className="mt-4 mb-8 sm:mt-8">
      <h2 id="answers" className="flex items-center">
        <FlagIcon className="fill-primary-700 mr-3" aria-hidden />

        <span>
          <Trans>Ma région de simulation</Trans>
        </span>
      </h2>
      <div className="my-4">
        <p className="mb-0">
          <Trans>Vous faites cette simulation depuis :</Trans>{' '}
          <strong>{regionObj.nom}</strong>
          <CountryFlag code={region} className="ml-2 inline-block" />.
        </p>

        <div className="flex flex-wrap items-baseline gap-2 sm:flex-nowrap">
          {region !== initialRegion && (
            <div className="mt-2">
              <Button
                color="text"
                size="sm"
                onClick={resetRegion as () => void}>
                <Trans>Revenir à ma région par défaut </Trans>{' '}
                <span aria-label={supportedRegions[initialRegion][locale].nom}>
                  <CountryFlag
                    code={initialRegion}
                    className="ml-2 inline-block"
                  />
                </span>
              </Button>
            </div>
          )}
          {'authors' in regionObj && (
            <RegionModelAuthors authors={regionObj.authors} />
          )}
        </div>
      </div>

      <RegionSelector updateRegion={updateRegion} region={region} />
    </div>
  )
}
