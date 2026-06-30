import { getCurrentModel, stringifyModel } from '@/helpers/server/model/models'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { getRegion } from '@/services/users/region'
import InvitationPage from './_components/InvitationPage'
import { groupInvitationGuard } from './guard'

export default async function RejoindreGroupePage({
  params,
  searchParams,
}: PageProps<'/[locale]/amis/invitation'>) {
  const { group } = await groupInvitationGuard(searchParams)
  const locale = (await params).locale as Locale
  const regionData = await getRegion()
  const userRegion = regionData!.current

  const currentSimulation =
    (await getCurrentSimulation()) ??
    generateSimulation({
      model: stringifyModel(getCurrentModel({ locale, userRegion })),
    })

  return (
    <InvitationPage
      currentSimulation={currentSimulation}
      group={group}
      locale={locale}
    />
  )
}
