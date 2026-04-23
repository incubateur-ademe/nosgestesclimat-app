import { useCreatePoll } from '@/hooks/organisations/polls/useCreatePoll'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  buildCreatePollPayload,
  clearDraft,
  readDraft,
} from './createPollDraft'

interface UseCreatePollStep2Props {
  organisationSlug: string
  revalidatePath: (slug: string) => void
}

interface Step2Inputs {
  mode: 'standard' | 'scolaire'
}

/**
 * Static mode options for poll creation
 */
export const pollModes = [
  {
    value: 'standard' as const,
    titleKey: 'collectiveTest.mode.standard.title',
    titleDefault: 'Mode standard',
    descriptionKey: 'collectiveTest.mode.standard.description',
    descriptionDefault:
      'Le test classique, pour tous les citoyennes et citoyens',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/empreinte_carbone_achats_be9fd99289.svg',
    imageAlt: 'Illustration mode standard',
  },
  {
    value: 'scolaire' as const,
    titleKey: 'collectiveTest.mode.scolaire.title',
    titleDefault: 'Mode scolaire',
    descriptionKey: 'collectiveTest.mode.scolaire.description',
    descriptionDefault:
      'Le test adapté aux jeunes (collège, lycée, étudiants...)',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_children_holding_hand_6951392e78.png',
    imageAlt: 'Illustration mode scolaire',
  },
] as const

export type PollMode = (typeof pollModes)[number]

/**
 * Hook for managing the second step of campaign creation (mode selection)
 */
export function useCreatePollStep2({
  organisationSlug,
  revalidatePath,
}: UseCreatePollStep2Props) {
  const router = useRouter()

  const { handleSubmit, register } = useForm<Step2Inputs>({
    defaultValues: {
      mode: 'standard',
    },
  })

  const {
    mutateAsync: createPoll,
    isError,
    isPending,
  } = useCreatePoll(organisationSlug)

  async function submitPoll({ mode }: Step2Inputs) {
    try {
      const draft = readDraft()

      if (!draft) {
        router.push(
          `/organisations/${organisationSlug}/creer-campagne/informations`
        )
        return
      }

      const payload = buildCreatePollPayload(draft, mode)

      const pollCreated = await createPoll(payload)

      revalidatePath(organisationSlug)

      clearDraft()

      router.push(
        `/organisations/${organisationSlug}/campagnes/${pollCreated.slug}`
      )
    } catch (error) {
      captureException(error)
    }
  }

  const onSubmit = handleSubmit(submitPoll)

  return {
    register,
    onSubmit,
    isPending,
    isError,
    modes: pollModes,
  }
}
