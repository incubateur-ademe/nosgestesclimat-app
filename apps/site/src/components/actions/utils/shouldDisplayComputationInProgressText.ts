import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'

/**
 * Whether an action's impact should read as "still being computed" rather than
 * as a value. Only a not-yet-completed computation can still produce one — a
 * computation that was never programmed never will.
 */
export function shouldDisplayComputationInProgressText(status: AssessmentStatus) {
  switch (status) {
    case 'completed':
    case 'never-assessed':
      return false
    case 'pending':
    case 'processing':
    case 'failed':
      return true
    default:
      status satisfies never
      return true
  }
}
