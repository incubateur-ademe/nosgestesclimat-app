import Trans from '@/components/translation/trans/TransServer'
import Subtitle from '@/design-system/layout/Subtitle'
import Title from '@/design-system/layout/Title'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Group } from '@/types/groups'
import InvitationForm from './InvitationForm'
import LaconicRanking from './LaconicRanking'

export default function InvitationPage({
  currentSimulation,
  group,
}: {
  currentSimulation?: Simulation
  group: Group
}) {
  return (
    <div className="p-4 md:p-8">
      <Title className="mb-2">
        <Trans>
          {group.administrator.name} vous a invité à rejoindre le groupe{' '}
          <span className="text-violet-900">{group.name}</span>
        </Trans>
      </Title>
      <Subtitle>
        <Trans>
          Comparez vos résultats avec votre famille ou un groupe d'amis.
        </Trans>
      </Subtitle>

      <InvitationForm group={group} currentSimulation={currentSimulation} />

      <LaconicRanking group={group} />
    </div>
  )
}
