import CommitToActionButton from '@/components/actions/highlightedActionCard/CommitToActionButton'
import { GET_PERSONALIZED_ACTION_DETAILS_CACHE_TAG } from '@/services/actions/get-personalized-action-details'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'

interface Props {
  action: MaybePersonalizedAction
}

export function ActionCommitmentBanner({ action }: Props) {
  if (!action.assessment) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex h-20 w-full items-center justify-center bg-white px-6 shadow-[0_-4px_14px_0_rgba(0,0,0,0.10)]">
      <CommitToActionButton
        action={action}
        cacheTagToUpdate={GET_PERSONALIZED_ACTION_DETAILS_CACHE_TAG}
      />
    </div>
  )
}
