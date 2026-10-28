import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import { linkToGroupCreation, SHOW_STEP_KEY } from '@/constants/group'
import GoBackButton from '@/design-system/inputs/GoBackButton'
import Subtitle from '@/design-system/layout/Subtitle'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { throwNextError } from '@/helpers/server/error'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { getLastCompletedSimulation } from '@/services/simulations/get-last-completed-simulation'
import type { DefaultPageProps } from '@/types'
import NameForm from './_components/NameForm'

export const generateMetadata = getCommonMetadata({
  title: t('Créer un groupe, étape 2 sur 2 - Nos Gestes Climat'),
  description: t(
    "Calculez votre empreinte carbone en groupe et comparez la avec l'empreinte de vos proches grâce au calculateur de bilan carbone personnel Nos Gestes Climat."
  ),
  alternates: {
    canonical: linkToGroupCreation,
  },
})

export default async function GroupNamePage({
  searchParams,
}: DefaultPageProps<{ searchParams: { [SHOW_STEP_KEY]: string } }>) {
  const { [SHOW_STEP_KEY]: showStep } = (await searchParams) ?? {}

  await requireAuthUser()
  const lastSimulation = await throwNextError(() =>
    getLastCompletedSimulation()
  )

  return (
    <div className="pb-8">
      <GoBackButton className="mb-4 font-bold" />

      {Boolean(showStep) && <StepsDisplay currentStep={2} />}

      <Title className="mb-2">
        <Trans>Créer un groupe d'amis</Trans>
      </Title>
      <Subtitle>
        <Trans>Invitez vos proches à passer le test</Trans>
      </Subtitle>
      <NameForm lastSimulation={lastSimulation} />
    </div>
  )
}
