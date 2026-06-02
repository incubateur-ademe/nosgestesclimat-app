import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { ensureSimulation } from '@/helpers/iframe/ensureSimulation'
import { isSafariIframe } from '@/helpers/iframe/isSafariIframe'
import { getUser } from '@/helpers/server/dal/user'
import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getNewSimulationModelService } from '../../_service/getNewSimulationModelService'
import Tutorial from '../_components/Tutorial'

export default async function TutorielPage({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const user = await getUser()

  let [currentSimulation, completedSimulations] = await Promise.all([
    getCurrentSimulation({ user }),
    getCompletedSimulations({ user }, { pageSize: 1 }),
  ])

  if (!currentSimulation) {
    const head = await headers()
    if (isSafariIframe(head)) {
      // Fallback for Safari-based iframes where third-party cookies
      // don't persist across redirects. Create the simulation right here
      // within the same request context so the user ID is stable.
      const model = await getNewSimulationModelService({
        searchParams,
        locale: locale as Locale,
      })
      currentSimulation = await ensureSimulation(user, model)
    } else {
      redirect('/')
    }
  }

  if (
    (currentSimulation?.progression ?? 0) > 0 ||
    completedSimulations.length
  ) {
    redirect(SIMULATOR_PATH)
  }

  return (
    <>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />
      <Tutorial
        locale={locale}
        buttonNext={
          <ButtonLink
            href={SIMULATOR_PATH}
            data-testid="skip-tutorial-button"
            className="min-w-42!">
            <Trans locale={locale}>C'est parti !</Trans>{' '}
            <span aria-hidden="true">→</span>
          </ButtonLink>
        }
      />
    </>
  )
}
