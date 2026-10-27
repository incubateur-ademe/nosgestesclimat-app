import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Group } from '@/types/groups'
import InvitationForm from './InvitationForm'
import LaconicRanking from './LaconicRanking'

export default async function InvitationPage({
  currentSimulation,
  group,
}: {
  currentSimulation?: Simulation
  group: Group
}) {
  const { t } = await getServerTranslation()

  return (
    <div className="p-4 md:p-8">
      <Title className="mb-2">
        <Trans>
          {group.administrator.name} vous a invité à rejoindre le groupe{' '}
          <span className="text-violet-900">{group.name}</span>
        </Trans>
      </Title>
      <p className="text-slate-500">
        <Trans>
          Comparez vos résultats avec votre famille ou un groupe d'amis.
        </Trans>
      </p>

      <InvitationForm group={group} currentSimulation={currentSimulation} />

      <LaconicRanking group={group} />
    </div>
  )
}
