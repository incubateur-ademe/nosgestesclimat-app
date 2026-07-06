'use client'

import { createPoll } from '@/services/organisations/create-poll'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { clearDraft, readDraft } from './createPollDraft'

interface UseCreatePollStep2Props {
  organisationSlug: string
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
    descriptionDefault: 'Le test adapté aux jeunes (collège, lycée)',
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
}: UseCreatePollStep2Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)
  const [draft] = useState(() => readDraft())

  useEffect(() => {
    if (!draft) {
      router.push(
        `/organisations/${organisationSlug}/creer-campagne/informations`
      )
    }
  }, [draft, organisationSlug, router])

  function handleSubmit(formData: FormData) {
    if (!draft) return

    setIsError(false)
    const mode = formData.get('mode') as string
    if (!mode) {
      setIsError(true)
      return
    }

    startTransition(async () => {
      try {
        await createPoll({
          organisationIdOrSlug: organisationSlug,
          poll: {
            ...draft,
            mode: mode as 'standard' | 'scolaire',
          },
        })
        clearDraft()
      } catch (err) {
        if (!(err instanceof Error) || !err.message.includes('NEXT_REDIRECT')) {
          setIsError(true)
        } else {
          throw err
        }
      }
    })
  }

  return {
    handleSubmit,
    isPending,
    isError,
    modes: pollModes,
  }
}
