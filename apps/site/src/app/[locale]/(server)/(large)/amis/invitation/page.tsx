'use client'

import GroupLoader from '@/components/groups/GroupLoader'
import GroupNotFound from '@/components/groups/GroupNotFound'
import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import { useFetchGroup } from '@/hooks/groups/useFetchGroup'
import { useGroupIdInQueryParams } from '@/hooks/groups/useGroupIdInQueryParams'
import { useGroupPagesGuard } from '@/hooks/navigation/useGroupPagesGuard'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import InvitationForm from './_components/InvitationForm'
import LaconicRanking from './_components/LaconicRanking'

export default function RejoindreGroupePage() {
  // Guarding the route and redirecting if necessary
  const { isGuardRedirecting } = useGroupPagesGuard()

  const { t } = useClientTranslation()

  const { groupIdInQueryParams } = useGroupIdInQueryParams()

  const { data: group, isLoading } = useFetchGroup(groupIdInQueryParams)

  // If we are still fetching the group (or we are redirecting the user), we display a loader
  if (isGuardRedirecting || isLoading) {
    return <GroupLoader />
  }

  // If the group doesn't exist, we display a 404 page
  if (!group) {
    return <GroupNotFound />
  }

  return (
    <div className="p-4 md:p-8">
      <Title
        title={
          <Trans>
            {group?.administrator?.name} vous a invité à rejoindre le groupe{' '}
            <span className="text-violet-900">{group?.name}</span>
          </Trans>
        }
        subtitle={t(
          "Comparez vos résultats avec votre famille ou un groupe d'amis."
        )}
      />

      <InvitationForm group={group} />

      <LaconicRanking group={group} />
    </div>
  )
}
