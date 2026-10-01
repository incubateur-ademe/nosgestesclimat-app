'use server'

import { abandonActionCommitment as _abandonActionCommitment } from '@nosgestesclimat/core/features/actions/services/abandon-action-commitment.service'
import { updateTag } from 'next/cache'
import { unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'
import { getPersonalizedActionDetailsCacheTagWithSlug } from './get-personalized-action-details'
import { GET_PERSONALIZED_ACTIONS_CACHE_TAG } from './get-personalized-actions-catalogue'

interface Props {
  actionId: string
  actionSlug: string
}

export async function abandonActionCommitment({ actionId, actionSlug }: Props) {
  const session = await getUserSession()
  if (!session) unauthorized()

  await _abandonActionCommitment({
    actionId,
    userId: session.id,
  })

  // Reset actions list AND specific action cache to avoid missmatch between pages
  updateTag(GET_PERSONALIZED_ACTIONS_CACHE_TAG)
  updateTag(getPersonalizedActionDetailsCacheTagWithSlug(actionSlug))
}
