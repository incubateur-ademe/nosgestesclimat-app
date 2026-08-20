import { WARNING_MESSAGE_ID } from '@/constants/warning'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

/**
 * Return a stable, unique HTML id for the warning of a given question.
 *
 * For the main question we keep the historical `WARNING_MESSAGE_ID` so the
 * existing `aria-describedby` wiring keeps working. For mosaic children we
 * append the (slugified) dotted name so each warning has its own id and can be
 * referenced by its corresponding field for accessibility.
 */
export function getWarningId(question: DottedName): string {
  return `${WARNING_MESSAGE_ID}-${question.replaceAll(' ', '-')}`
}
