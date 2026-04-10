'use client'

import Baseline from '@/components/organisations/Baseline'
import Trans from '@/components/translation/trans/TransClient'
import {
  organisationsAccueilClickCommencer,
  organisationsAccueilClickDemo,
} from '@/constants/tracking/pages/organisationsAccueil'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <div className="flex flex-wrap justify-center gap-12 pt-14 lg:flex-nowrap lg:justify-start lg:gap-16">
      <div className="max-w-full md:w-[34rem]">
        <h1>
          <Trans i18nKey="organisations.accueil.titre">
            Nos Gestes Climat pour les organisations et les animateurs
          </Trans>
        </h1>

        <div className="mb-12 text-sm md:text-lg">
          <Baseline />
        </div>
        <ul className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:justify-start md:items-baseline md:gap-8 lg:justify-start">
          <li>
            <ButtonLink
              href="/organisations/connexion"
              data-testid="start-link"
              trackingEvent={organisationsAccueilClickCommencer}>
              <Trans>Commencer</Trans>
            </ButtonLink>
          </li>

          <li>
            <ButtonLink
              color="text"
              href="/organisations/demander-demo"
              onClick={() => {
                trackMatomoEvent__deprecated(organisationsAccueilClickDemo)
              }}>
              <Trans>Demander une démo</Trans>
            </ButtonLink>
          </li>
        </ul>
      </div>

      <div>
        <Image
          className="self-start"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_people_with_paperboard_9c8d47f4b3.png"
          width="400"
          height="400"
          alt=""
        />
      </div>
    </div>
  )
}
