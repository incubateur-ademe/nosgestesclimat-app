import CommitToActionButton from '@/components/actions/highlightedActionCard/CommitToActionButton'
import BottomBannerWithCTA from '@/design-system/layout/BottomBannerWithCTA'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'

interface Props {
  action: MaybePersonalizedAction
}

export function ActionCommitmentBanner({ action }: Props) {
  if (!action.assessment) return null

  return (
    <BottomBannerWithCTA>
      <CommitToActionButton
        buttonColor="primary"
        className="w-full sm:w-72"
        action={action}
      />
    </BottomBannerWithCTA>
  )
}
