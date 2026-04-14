'use client'

import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIsClient } from '@/hooks/useIsClient'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import Image from 'next/image'
import { useState } from 'react'
import CloseIcon from '../icons/Close'
import Trans from '../translation/trans/TransClient'

const HIDE_BANNER_KEY = 'jva-status'

export default function JVABanner() {
  const { t } = useClientTranslation()

  const [isHidden, setIsHidden] = useState(
    safeLocalStorage.getItem(HIDE_BANNER_KEY) === 'hidden'
  )

  const isClient = useIsClient()

  if (!isClient || isHidden) return null

  const handleCloseBanner = () => {
    safeLocalStorage.setItem(HIDE_BANNER_KEY, 'hidden')
    setIsHidden(true)
  }

  return (
    <div className="bg-primary-100 relative mb-6 flex flex-col gap-4 rounded-2xl p-6 pt-12 md:flex-row md:justify-between md:gap-8 md:pt-6">
      <button
        aria-label={t('actions.jva.banner.close', 'Cacher la bannière')}
        className="absolute top-4 right-5"
        onClick={handleCloseBanner}>
        <CloseIcon />
      </button>

      <div className="flex flex-col gap-6">
        <div>
          <Title
            hasSeparator={false}
            tag="h2"
            size="md"
            className="mb-2 font-medium">
            <Trans i18nKey="actions.jva.banner.title">
              Faites du bénévolat pour préserver l’environnement
            </Trans>
          </Title>

          <p className="md:w-xl">
            <Trans i18nKey="actions.jva.banner.text1">
              Dépollution, sensibilisation, soin aux animaux, ateliers de
              réparation et potager urbain.{' '}
            </Trans>
          </p>
        </div>

        <p className="mb-0 font-bold">
          <Trans i18nKey="actions.jva.banner.text2">
            Rejoignez l’opération Printemps pour la planète sur{' '}
            <span className="underline">JeVeuxAider.gouv.fr</span>{' '}
          </Trans>
        </p>

        <ButtonLink
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(
            "J'y vais, accéder au site je veux aider.gouv, nouvelle fenêtre"
          )}
          className="w-full md:w-auto md:self-start"
          href="https://www.jeveuxaider.gouv.fr/missions-benevolat?domaines=Protection+de+la+nature">
          <Trans i18nKey="actions.jva.banner.cta">J'y vais !</Trans>
        </ButtonLink>
      </div>

      <div className="mx-auto w-32 md:w-auto">
        <Image
          src={
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg'
          }
          width={200}
          height={300}
          className="md:mx-4"
          alt=""
        />
      </div>
    </div>
  )
}
