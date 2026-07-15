import {
  COLLECTIVE_TEST_INFORMATIONS_PATH,
  START_SIMULATION_PATH,
} from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMainCTA } from '@/helpers/server/getLinkToSimulateur'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { Suspense } from 'react'
import { twMerge } from 'tailwind-merge'
import RotatingArrowIcon from '../icons/RotatingArrowIcon'
import Trans from '../translation/trans/TransServer'
import CTAButtonsPlaceholder from './CTAButtonsPlaceholder'

interface Props {
  withCollectiveTest?: boolean
  withRestart?: boolean
  className?: string
  locale: string
}

export default function CTAButtons(props: Props) {
  return (
    <Suspense fallback={<CTAButtonsPlaceholder />}>
      <ServerCTAButtons {...props} />
    </Suspense>
  )
}

async function ServerCTAButtons({
  withCollectiveTest = false,
  withRestart = false,
  className = '',
  locale,
}: Props) {
  const user = await getUserSession()
  const [currentSimulation, completedSimulations] = await Promise.all([
    getCurrentSimulation(),
    getCompletedSimulations({ pageSize: 1 }),
  ])
  const { t } = await getServerTranslation({ locale })

  const showRestart =
    withRestart && currentSimulation && currentSimulation.progression > 0
  const isButtonList = withCollectiveTest || showRestart

  const ContainerTag = isButtonList ? 'ul' : 'div'
  const MainButtonContainerTag = isButtonList ? 'li' : 'div'

  const mainButton = getMainCTA({
    currentSimulation,
    completedSimulations,
    user,
    t,
  })

  return (
    <ContainerTag
      className={twMerge(
        'flex flex-col flex-wrap items-center justify-center gap-2 md:items-start lg:flex-row',
        isButtonList && 'lg:grid lg:grid-cols-2'
      )}>
      <MainButtonContainerTag className="w-full lg:col-span-1 lg:w-auto">
        <ButtonLink
          size="xl"
          className={twMerge(
            'group hover:bg-primary-900 h-16 w-full transition-all duration-300',
            className
          )}
          href={mainButton.href}
          data-testid="main-cta">
          <>
            <span
              className={twMerge(
                'leading-none',
                'group-hover:bg-rainbow group-hover:animate-rainbow-fast group-hover:bg-clip-text group-hover:text-transparent motion-reduce:animate-none'
              )}>
              {mainButton.children}
            </span>
          </>
        </ButtonLink>
      </MainButtonContainerTag>

      {withCollectiveTest && (
        <li className="h-full lg:col-span-1 lg:w-auto">
          <ButtonLink
            size="xl"
            color="secondary"
            className="group h-16 px-6"
            data-testid="organisation-link"
            href={COLLECTIVE_TEST_INFORMATIONS_PATH}>
            <span
              className={twMerge(
                'leading-none',
                'group-hover:bg-rainbow-dark group-hover:animate-rainbow-fast group-hover:bg-clip-text group-hover:text-transparent motion-reduce:animate-none'
              )}>
              <Trans locale={locale} i18nKey="ctaButtons.collective.label">
                Créer un test collectif
              </Trans>
            </span>
          </ButtonLink>
        </li>
      )}
      {showRestart && (
        <li className="w-full text-center lg:col-span-1 lg:w-auto">
          <ButtonLink
            data-testid="restart-link"
            className="mt-1 w-full text-base"
            href={START_SIMULATION_PATH}
            color="link"
            size="sm">
            <Trans locale={locale} i18nKey="ctaButtons.retake.label">
              Repasser le test
            </Trans>
            <RotatingArrowIcon className="fill-primary-900 ml-3 w-4" />
          </ButtonLink>
        </li>
      )}
    </ContainerTag>
  )
}
