import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import { throwNextError } from '@/helpers/server/error'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { deleteSimulation } from '@/services/simulations/delete-simulation'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import type { DefaultPageProps } from '@/types'
import { revalidatePath } from 'next/cache'
import ResultsView from './_components/ResultsView'
import WelcomeBanner from './_components/WelcomeBanner'

export default async function Page({ params, searchParams }: DefaultPageProps) {
  const { locale } = await params
  const { [SHOW_WELCOME_BANNER_QUERY_PARAM]: showWelcomeBanner } =
    (await searchParams) ?? {}

  await requireAuthUser()
  const simulations = await throwNextError(() => getCompletedSimulations())

  return (
    <div>
      {showWelcomeBanner && simulations.length > 0 && (
        <WelcomeBanner locale={locale} />
      )}

      <ResultsView
        onSimulationDelete={async (simulationId) => {
          'use server'
          await deleteSimulation(simulationId)
          revalidatePath(MON_ESPACE_PATH)
          revalidatePath(`${MON_ESPACE_PATH}/resultats/${simulationId}`)
        }}
        locale={locale}
        simulations={simulations}
        isNewAccount={showWelcomeBanner === 'true'}
      />
    </div>
  )
}
