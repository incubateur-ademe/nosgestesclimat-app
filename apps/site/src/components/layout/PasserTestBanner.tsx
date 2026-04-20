import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUser } from '@/helpers/server/dal/user'
import { getLinkToSimulateur } from '@/helpers/server/getLinkToSimulateur'
import { getSimulations } from '@/helpers/server/model/simulations'
import Trans from '../translation/trans/TransServer'

export default async function PasserTestBanner({ locale }: { locale: string }) {
  const user = await getUser()
  const currentSimulation = (await getSimulations({ user }, { pageSize: 1 }))[0]
  const { t } = await getServerTranslation({ locale })

  // Do not show the banner if the user has completed his/her test
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (currentSimulation?.progression === 1) return null
  return (
    <Card className="mb-4 flex-row flex-wrap items-baseline justify-between gap-4 border-none bg-gray-100 p-4 sm:flex-nowrap sm:p-6">
      <p className="mb-0">
        <Trans locale={locale}>
          Calculez votre empreinte sur le climat
          <span className="text-secondary-800 font-bold"> en 10 minutes </span>
          top chrono.
        </Trans>
      </p>
      <ButtonLink {...getLinkToSimulateur({ currentSimulation, user, t })} />
    </Card>
  )
}
