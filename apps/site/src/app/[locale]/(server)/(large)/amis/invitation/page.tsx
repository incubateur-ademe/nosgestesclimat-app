import type { Locale } from '@/i18nConfig'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import InvitationPage from './_components/InvitationPage'
import { groupInvitationGuard } from './guard'

export default async function RejoindreGroupePage({
  params,
  searchParams,
}: PageProps<'/[locale]/amis/invitation'>) {
  const { group } = await groupInvitationGuard(searchParams)
  const locale = (await params).locale as Locale

  const currentSimulation = await getCurrentSimulation()

  return (
    <InvitationPage
      currentSimulation={currentSimulation}
      group={group}
      locale={locale}
    />
  )
}
