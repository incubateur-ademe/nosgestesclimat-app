import {
  END_PAGE_PATH,
  MON_ESPACE_PATH,
  SIMULATOR_PATH,
  START_SIMULATION_PATH,
  TUTORIAL_PATH,
} from '@/constants/urls/paths'
import type { UserSession } from '@nosgestesclimat/core/features/auth/types/user-session'
import {
  hasCompletedCurrentSimulation,
  hasCompletedSimulation,
  hasSimulation,
  hasUnstartedSimulation,
} from '@nosgestesclimat/core/features/simulations/helpers/user-simulation-journey'
import type { UserSimulationJourney } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'
import type { TFunction } from 'i18next'

export function getMainCTA({
  journey,
  user,
  t,
}: {
  journey: UserSimulationJourney
  user: UserSession
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: TFunction<any, string>
}) {
  if (!hasSimulation(journey)) {
    return {
      children: t('Commencer le test'),
      href: START_SIMULATION_PATH,
      prefetch: false,
    }
  }

  if (hasUnstartedSimulation(journey)) {
    return {
      children: t('Commencer le test'),
      href: hasCompletedSimulation(journey) ? SIMULATOR_PATH : TUTORIAL_PATH,
    }
  }
  if (hasCompletedCurrentSimulation(journey)) {
    return {
      children: t('Voir mes résultats'),
      href: user?.isAuth ? MON_ESPACE_PATH : END_PAGE_PATH,
    }
  }

  // If the user has seen the tutoriel we return the test page label
  return {
    children: t('Reprendre mon test'),
    href: SIMULATOR_PATH,
  }
}
