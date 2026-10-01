'use client'

import CloseIcon from '@/components/icons/Close'
import Loader from '@/design-system/layout/Loader'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useActionCommitment } from '../../highlightedActionCard/commitToActionButton/useActionCommitment'

interface Props {
  action: PersonalizedAction
}

export default function AbandonCommitmentButton({ action }: Props) {
  const { abandonActionCommitment, isPending } = useActionCommitment(action)
  return (
    <button className="flex" onClick={abandonActionCommitment}>
      {isPending ? (
        <div className="size-5">
          <Loader size="sm" color="dark" />
        </div>
      ) : (
        <CloseIcon className="size-5 fill-slate-600 transition-all hover:fill-slate-700 active:scale-90" />
      )}
    </button>
  )
}
