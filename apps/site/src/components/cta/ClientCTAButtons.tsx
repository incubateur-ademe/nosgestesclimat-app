'use client'
import { useEndTest } from '@/app/[locale]/(simulation)/simulateur/[root]/_hooks/useEndPage'
import {
  END_PAGE_PATH,
  MON_ESPACE_PATH,
  ORGANISATION_CREATE_PATH,
} from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Loader from '@/design-system/layout/Loader'
import { revalidatePathAction } from '@/helpers/server/revalidate'
import { useSimulateurPage } from '@/hooks/navigation/useSimulateurPage'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation, useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import RotatingArrowIcon from '../icons/RotatingArrowIcon'
import Trans from '../translation/trans/TransClient'
import CTAButtonsPlaceholder from './CTAButtonsPlaceholder'

interface Props {
  className?: string
  trackingEvents: {
    start: string[]
    startPosthog?: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
    resume: string[]
    resumePosthog?: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
    results: string[]
    resultsPosthog?: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
    restart?: string[]
    restartPosthog?: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
    createCollectiveTest?: string[]
  }
  withRestart?: boolean
  withCollectiveTest?: boolean
  isAuthenticated: boolean
}

export default function ClientCTAButtons({
  className,
  trackingEvents,
  withRestart = true,
  withCollectiveTest = false,
  isAuthenticated,
}: Props) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const { getLinkToSimulateurPage, linkToSimulateurPageLabel } =
    useSimulateurPage()

  const { t } = useClientTranslation()

  const { progression } = useCurrentSimulation()
  const { simulations, initSimulation } = useUser()

  const [isHover, setIsHover] = useState(false)

  const userIsAuthenticatedAndHasMultipleSimulations =
    isAuthenticated && simulations.length > 1

  const showBothButtons =
    withRestart &&
    // Progression 1 > not authenticated user
    (progression === 1 || userIsAuthenticatedAndHasMultipleSimulations)

  const mainButtonLabel = useMemo(() => {
    // Default case for both unauthenticated and authenticated users
    if (progression === 1 || userIsAuthenticatedAndHasMultipleSimulations) {
      return t('Voir mes résultats')
    }

    return linkToSimulateurPageLabel
  }, [
    linkToSimulateurPageLabel,
    t,
    progression,
    userIsAuthenticatedAndHasMultipleSimulations,
  ])

  const mainButtonHref = useMemo(() => {
    if (
      userIsAuthenticatedAndHasMultipleSimulations ||
      (isAuthenticated && progression === 1)
    ) {
      return MON_ESPACE_PATH
    }

    return getLinkToSimulateurPage()
  }, [
    userIsAuthenticatedAndHasMultipleSimulations,
    progression,
    getLinkToSimulateurPage,
    isAuthenticated,
  ])

  const { endTest, isPending } = useEndTest()
  if (!isHydrated) {
    return <CTAButtonsPlaceholder className={className} />
  }
  const handleMainButtonClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (progression === 1 || userIsAuthenticatedAndHasMultipleSimulations) {
      trackMatomoEvent__deprecated(trackingEvents.results)
      if (trackingEvents.resultsPosthog) {
        trackPosthogEvent(trackingEvents.resultsPosthog)
      }
      if (!isAuthenticated) {
        e.preventDefault()
        // Save on server
        void endTest()
      }
      return
    }

    if (progression > 0) {
      trackMatomoEvent__deprecated(trackingEvents.resume)
      if (trackingEvents.resumePosthog) {
        trackPosthogEvent(trackingEvents.resumePosthog)
      }
      return
    }

    trackMatomoEvent__deprecated(trackingEvents.start)
    if (trackingEvents.startPosthog) {
      trackPosthogEvent(trackingEvents.startPosthog)
    }
  }

  const handleRestartClick = () => {
    if (progression === 1) {
      initSimulation()
      void revalidatePathAction(END_PAGE_PATH, 'layout')
    }
  }

  const ContainerTag = withCollectiveTest || showBothButtons ? 'ul' : 'div'
  const MainButtonContainerTag =
    withCollectiveTest || showBothButtons ? 'li' : 'div'

  return (
    <ContainerTag
      className={twMerge(
        'flex flex-col flex-wrap items-center justify-center gap-2 md:items-start lg:flex-row',
        (withCollectiveTest || showBothButtons) && 'lg:grid lg:grid-cols-2'
      )}>
      <MainButtonContainerTag className="w-full lg:col-span-1 lg:w-auto">
        <ButtonLink
          size="xl"
          className={twMerge(
            'hover:bg-primary-900 w-full transition-all duration-300',
            className
          )}
          href={mainButtonHref}
          aria-disabled={isPending}
          data-testid="do-the-test-link"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={handleMainButtonClick}>
          <>
            {isPending && <Loader color="light" size="sm" className="mr-2" />}
            <span
              className={twMerge(
                isHover
                  ? 'bg-rainbow animate-rainbow-fast bg-clip-text! text-transparent! duration-1000 motion-reduce:animate-none'
                  : '',
                'leading-none'
              )}>
              <Trans>{mainButtonLabel}</Trans>
            </span>
          </>
        </ButtonLink>
      </MainButtonContainerTag>

      {withCollectiveTest && (
        <li className="h-full lg:col-span-1 lg:w-auto">
          <ButtonLink
            size="xl"
            color="secondary"
            className="h-full px-6"
            trackingEvent={trackingEvents.createCollectiveTest}
            data-testid="organisation-link"
            href={ORGANISATION_CREATE_PATH}>
            <Trans i18nKey="ctaButtons.collective.label">
              Créer un test collectif
            </Trans>
          </ButtonLink>
        </li>
      )}
      {showBothButtons && (
        <li className="w-full text-center lg:col-span-1 lg:w-auto">
          <ButtonLink
            data-testid="restart-link"
            className="mt-1 w-full text-base"
            trackingEvent={
              progression !== 1 ? trackingEvents.resume : trackingEvents.restart
            }
            href={getLinkToSimulateurPage({
              newSimulation: progression === 1,
            })}
            onClick={handleRestartClick}
            color="link"
            size="sm">
            <Trans i18nKey="ctaButtons.retake.label">Repasser le test</Trans>
            <RotatingArrowIcon className="fill-primary-900 ml-3 w-4" />
          </ButtonLink>
        </li>
      )}
    </ContainerTag>
  )
}
