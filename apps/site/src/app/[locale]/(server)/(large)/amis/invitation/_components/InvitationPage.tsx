import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Group } from '@/types/groups'
import InvitationForm from './InvitationForm'
import LaconicRanking from './LaconicRanking'

export default async function InvitationPage({
  currentSimulation,
  group,
  locale,
}: {
  currentSimulation: Simulation
  group: Group
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="p-4 md:p-8">
      <Title
        title={
          <Trans>
            {group.administrator.name} vous a invité à rejoindre le groupe{' '}
            <span className="text-violet-900">{group.name}</span>
          </Trans>
        }
        subtitle={t(
          "Comparez vos résultats avec votre famille ou un groupe d'amis."
        )}
      />

      <InvitationForm group={group} currentSimulation={currentSimulation} />

      <LaconicRanking group={group} />
    </div>
  )
}
