import { getAnonSession } from '@/helpers/server/dal/anonSession'
import { getUser } from '@/helpers/server/dal/user'
import {
  getCurrentModel,
  getGeolocation,
  stringifyModel,
} from '@/helpers/server/model/models'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import InvitationPage from './_components/InvitationPage'

export default async function RejoindreGroupePage({
  params,
}: PageProps<'/[locale]/amis/invitation'>) {
  const user = await getUser()
  const locale = (await params).locale as Locale
  const userRegion = (await getAnonSession()).region ?? (await getGeolocation())

  const currentSimulation =
    (await getCurrentSimulation({ user })) ??
    generateSimulation({
      model: stringifyModel(getCurrentModel({ locale, userRegion })),
    })
  return <InvitationPage currentSimulation={currentSimulation} />
}
