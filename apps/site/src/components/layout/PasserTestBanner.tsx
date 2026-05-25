import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUser } from '@/helpers/server/dal/user'
import { getMainCTA } from '@/helpers/server/getLinkToSimulateur'
import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import { Suspense } from 'react'
import Trans from '../translation/trans/TransServer'

export default function PasserTestBanner({ locale }: { locale: string }) {
  return (
    <Suspense>
      <PasserTestBannerServer locale={locale} />
    </Suspense>
  )
}

async function PasserTestBannerServer({ locale }: { locale: string }) {
  const user = await getUser()
  const [currentSimulation, completedSimulations] = await Promise.all([
    getCurrentSimulation({ user }),
    getCompletedSimulations({ user }, { pageSize: 1 }),
  ])
  const { t } = await getServerTranslation({ locale })

  // Do not show the banner if the user has completed his/her test
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
      <ButtonLink
        {...getMainCTA({ currentSimulation, completedSimulations, user, t })}
      />
    </Card>
  )
}
