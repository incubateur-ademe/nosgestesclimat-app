'use client'
import { useEndTest } from '@/app/[locale]/(simulation)/simulateur/[root]/_hooks/useEndPage'
import { END_PAGE_PATH, MON_ESPACE_PATH } from '@/constants/urls/paths'
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
import RestartIcon from '../icons/RestartIcon'
import Trans from '../translation/trans/TransClient'
import CTAButtonsPlaceholder from './CTAButtonsPlaceholder'

export default function ClientCTAButtons({
  className,
  trackingEvents,
  withRestart = true,
  isAuthenticated,
}: {
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
  }
  withRestart?: boolean
  isAuthenticated: boolean
}) {
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

  const ContainerTag = showBothButtons ? 'ul' : 'div'
  const MainButtonContainerTag = showBothButtons ? 'li' : 'div'

  return (
    <ContainerTag className="flex flex-col flex-wrap items-center justify-center gap-2 md:items-start lg:flex-row lg:flex-nowrap">
      <MainButtonContainerTag>
        <ButtonLink
          size="xl"
          className={twMerge(
            'hover:bg-primary-900 transition-all duration-300',
            className
          )}
          href={'/tutoriel/jeune'}
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

      {showBothButtons && (
        <li>
          <ButtonLink
            size="xl"
            color="secondary"
            className="leading-none"
            trackingEvent={
              progression !== 1 ? trackingEvents.resume : trackingEvents.restart
            }
            onClick={handleRestartClick}
            data-testid="restart-link"
            href={getLinkToSimulateurPage({
              newSimulation: progression === 1,
            })}>
            {progression !== 1 ? (
              <Trans>Reprendre mon test</Trans>
            ) : (
              <>
                <RestartIcon className="fill-primary-700 mr-2" />
                <Trans>Recommencer</Trans>
              </>
            )}
          </ButtonLink>
        </li>
      )}
    </ContainerTag>
  )
}
