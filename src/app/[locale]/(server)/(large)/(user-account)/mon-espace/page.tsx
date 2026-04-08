import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { throwNextError } from '@/helpers/server/error'
import { getSimulations } from '@/helpers/server/model/simulations'
import { getAuthUser } from '@/helpers/server/model/user'
import type { DefaultPageProps } from '@/types'
import ResultsView from './_components/ResultsView'
import WelcomeBanner from './_components/WelcomeBanner'

export default async function Page({ params, searchParams }: DefaultPageProps) {
  const { locale } = await params
  const { [SHOW_WELCOME_BANNER_QUERY_PARAM]: showWelcomeBanner } =
    (await searchParams) ?? {}

  const simulations = await throwNextError(async () => {
    const user = await getAuthUser()
    return getSimulations({ user }, { completedOnly: true })
  })

  return (
    <div data-track className="flex flex-col">
      {showWelcomeBanner && simulations.length > 0 && (
        <WelcomeBanner locale={locale} />
      )}

      <ResultsView locale={locale} simulations={simulations} />
    </div>
  )
}
