import CommitToActionButton from '@/components/actions/highlightedActionCard/CommitToActionButton'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'

interface Props {
  action: MaybePersonalizedAction
}

export function ActionCommitmentBanner({ action }: Props) {
  if (!action.assessment) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex h-20 w-full items-center justify-center bg-white px-6 shadow-[0_-4px_14px_0_rgba(0,0,0,0.10)]">
      <CommitToActionButton
        buttonColor="primary"
        className="w-full sm:w-72"
        action={action}
      />
    </div>
  )
}
