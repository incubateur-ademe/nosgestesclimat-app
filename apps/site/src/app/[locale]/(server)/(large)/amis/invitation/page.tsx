import {
  getCurrentModel,
  stringifyModel,
} from '@/helpers/server/model/models'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/users/get-user-session'
import { getRegion } from '@/services/users/region'
import InvitationPage from './_components/InvitationPage'

export default async function RejoindreGroupePage({
  params,
}: PageProps<'/[locale]/amis/invitation'>) {
  const user = await getUserSession()
  const locale = (await params).locale as Locale
  const regionData = await getRegion()
  const userRegion = regionData!.current

  const currentSimulation =
    (await getCurrentSimulation({ user })) ??
    generateSimulation({
      model: stringifyModel(getCurrentModel({ locale, userRegion })),
    })
  return <InvitationPage currentSimulation={currentSimulation} />
}
