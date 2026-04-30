import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { readDraft, writeDraft, type PollDraft } from './createPollDraft'

interface UseCreatePollStep1Props {
  organisationSlug: string
}

export function useCreatePollStep1({
  organisationSlug,
}: UseCreatePollStep1Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const previousData = readDraft()

  const form = useForm<PollDraft>({
    defaultValues: previousData ?? {},
  })

  const { handleSubmit, register, formState } = form

  function saveAndNavigate(data: PollDraft) {
    writeDraft(data)

    startTransition(() => {
      // Small delay to improve UX (show loading state)
      setTimeout(
        () =>
          router.push(`/organisations/${organisationSlug}/creer-campagne/mode`),
        1000
      )
    })
  }

  const onSubmit = handleSubmit(saveAndNavigate)

  return {
    register,
    errors: formState.errors,
    onSubmit,
    isPending,
  }
}
