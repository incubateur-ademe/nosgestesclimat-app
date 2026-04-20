import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'
import Tutorial from '../_components/Tutorial'

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

  return (
    <Tutorial
      locale={locale}
      buttonNext={
        <ButtonLink
          href={SIMULATOR_PATH}
          data-testid="skip-tutorial-button"
          className="min-w-42!">
          <Trans locale={locale}>C'est parti !</Trans>{' '}
          <span aria-hidden="true">→</span>
        </ButtonLink>
      }
    />
  )
}
