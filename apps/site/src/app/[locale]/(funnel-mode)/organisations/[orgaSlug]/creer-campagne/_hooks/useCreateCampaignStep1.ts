import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  readDraft,
  writeDraft,
  type CampaignDraft,
} from './createCampaignDraft'

interface UseCreateCampaignStep1Props {
  organisationSlug: string
}

export function useCreateCampaignStep1({
  organisationSlug,
}: UseCreateCampaignStep1Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const previousData = readDraft()

  const form = useForm<CampaignDraft>({
    defaultValues: previousData ?? {},
  })

  const { handleSubmit, register, formState } = form

  function saveAndNavigate(data: CampaignDraft) {
    writeDraft(data)

    // Small delay to improve UX (show loading state)
    setTimeout(() => {
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
