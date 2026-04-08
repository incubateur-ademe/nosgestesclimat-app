'use client'

import NewTabSvg from '@/components/icons/NewTabSvg'
import RegionGrid from '@/components/misc/RegionGrid'
import Trans from '@/components/translation/trans/TransClient'
import {
  profilClickRegion,
  profilOpenRegions,
} from '@/constants/tracking/pages/profil'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import {
  supportedRegions,
  type UserRegion,
} from '@/helpers/server/model/models'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useState } from 'react'

interface Props {
  isOpen?: boolean
  updateRegion: (code: UserRegion) => Promise<void>
  region: UserRegion
}

export default function RegionSelector({
  isOpen = false,
  updateRegion,
  region,
}: Props) {
  const locale = useLocale()
  const numberOfRegions = Object.values(supportedRegions).filter(
    (region) => locale in region
  ).length

  const { hideTutorial } = useUser()
  const [currentRegion, setCurrentRegion] = useState(region)
  async function onUpdate(code: UserRegion) {
    setCurrentRegion(code)
    trackMatomoEvent__deprecated(profilClickRegion(code))

    await updateRegion(code)

    hideTutorial('localisation-banner')
  }

  return (
    <>
      <details open={isOpen} className="rounded-xl bg-gray-100 p-2">
        <summary
          className="middle w-auto cursor-pointer p-4"
          onClick={() => trackMatomoEvent__deprecated(profilOpenRegions)}
          aria-expanded={isOpen}
          aria-controls="region-grid"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              trackMatomoEvent__deprecated(profilOpenRegions)
            }
          }}>
          <span>
            <Trans>Choisir une autre région</Trans>{' '}
            <small title={`${numberOfRegions} régions`}>
              ({numberOfRegions} <Trans>disponibles</Trans>)
            </small>
          </span>

          <span className="sr-only">
            <Trans>Cliquez pour ouvrir la liste des régions disponibles</Trans>
          </span>
        </summary>

        <RegionGrid
          id="region-grid"
          updateCurrentRegion={onUpdate as (code: string) => void}
          selectedRegionCode={currentRegion}
          role="region"
          aria-label="Liste des régions disponibles"
        />

        <Card className="mt-4 flex-row items-center border-none bg-transparent shadow-none">
          <Emoji className="mr-2">🌐</Emoji>
          <p className="mb-0">
            <Trans>Envie de contribuer à une version pour votre région ?</Trans>{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="align-top"
              href="https://accelerateur-transition-ecologique-ademe.notion.site/Ajouter-une-nouvelle-r-gion-f7e3a09a975d423f826ae654a788f8ba">
              <Trans>Suivez le guide !</Trans>
              <NewTabSvg className="-mt-1" />
            </a>
          </p>
        </Card>
      </details>
    </>
  )
}
