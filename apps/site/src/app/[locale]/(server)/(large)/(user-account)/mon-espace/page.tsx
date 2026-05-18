import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import { throwNextError } from '@/helpers/server/error'
import {
  deleteSimulation,
  getCompletedSimulations,
} from '@/helpers/server/model/simulations'
import { getAuthUser } from '@/helpers/server/model/user'
import type { DefaultPageProps } from '@/types'
import { revalidatePath } from 'next/cache'
import ResultsView from './_components/ResultsView'
import WelcomeBanner from './_components/WelcomeBanner'

export default async function Page({ params, searchParams }: DefaultPageProps) {
  const { locale } = await params
  const { [SHOW_WELCOME_BANNER_QUERY_PARAM]: showWelcomeBanner } =
    (await searchParams) ?? {}

  const [simulations, user] = await throwNextError(async () => {
    const user = await getAuthUser()
    return [await getCompletedSimulations({ user }), user]
  })

  return (
    <div data-track>
      {showWelcomeBanner && <WelcomeBanner locale={locale} />}

      <ResultsView
        onSimulationDelete={async (simulationId) => {
          'use server'
          await deleteSimulation({ user, simulationId })
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
