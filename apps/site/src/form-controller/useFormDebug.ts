'use client'

import { useFormController } from '@/form-controller/core/useFormController'

/**
 * What only the debug question list shows: every relevant question and the
 * engine's missing-variable score per question. Kept out of the other windows
 * so no product code reads it.
 */
export function useFormDebug() {
  const { relevantQuestions, missingVariables } = useFormController()
  return { relevantQuestions, missingVariables }
}
