'use client'

import { useTrackSimulator } from '@/hooks/tracking/useTrackSimulator'
import { useFormState } from '@/publicodes-state'
import { useSyncQuestionWithQueryParams } from '@/publicodes-state/providers/formProvider/hooks/useCurrent'
import Form from './_components/Form'

export default function Page() {
  useTrackSimulator()
  const { currentQuestion } = useFormState()
  useSyncQuestionWithQueryParams(currentQuestion)

  return <Form />
}
