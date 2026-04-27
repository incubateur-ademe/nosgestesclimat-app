import {
  END_PAGE_PATH,
  MON_ESPACE_PATH,
  SIMULATOR_PATH,
  START_SIMULATION_PATH,
  TUTORIAL_PATH,
} from '@/constants/urls/paths'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { TFunction } from 'i18next'
import type { AppUser } from './dal/user'
export function getMainCTA({
  currentSimulation,
  user,
  t,
}: {
  currentSimulation?: Simulation
  user: AppUser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: TFunction<any, string>
}) {
  if (!currentSimulation) {
    return {
      children: t('Commencer le test'),
      href: START_SIMULATION_PATH,
      prefetch: false,
    }
  }
  if (currentSimulation.progression === 0) {
    return {
      children: t('Commencer le test'),
      href: TUTORIAL_PATH,
    }
  }
  if (currentSimulation.progression === 1) {
    return {
      children: t('Voir mes résultats'),
      href: user.isAuth ? MON_ESPACE_PATH : END_PAGE_PATH,
    }
  }

  // If the user has seen the tutoriel we return the test page label
  return {
    children: t('Reprendre mon test'),
    href: SIMULATOR_PATH,
  }
}
