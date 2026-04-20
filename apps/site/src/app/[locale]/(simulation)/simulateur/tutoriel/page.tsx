import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations, isScolaire } from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'
import Tutorial from './_components/Tutorial'
import YouthTutorial from './_components/YouthTutorial'

export default async function TutorielPage({
  params,
}: PageProps<'/[locale]/simulateur/tutoriel'>) {
  const { locale } = await params
  const user = await getUser()
  const [currentSimulation, previousSimulation] = await getSimulations(
    { user },
    { pageSize: 2, completedOnly: false }
  )

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!currentSimulation) {
    redirect('/')
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (currentSimulation.progression > 0 || previousSimulation) {
    redirect(SIMULATOR_PATH)
  }

  if (isScolaire(currentSimulation)) {
    return <YouthTutorial locale={locale} />
  }

  return <Tutorial locale={locale} />
}
