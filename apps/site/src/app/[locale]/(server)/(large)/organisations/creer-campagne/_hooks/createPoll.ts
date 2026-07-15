'use client'

import {
  COLLECTIVE_TEST_CONNEXION_PATH,
  COLLECTIVE_TEST_INFORMATIONS_PATH,
  COLLECTIVE_TEST_MODE_PATH,
  COLLECTIVE_TEST_ORGANISATION_PATH,
} from '@/constants/urls/paths'
import { createPoll } from '@/services/organisations/create-poll'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import {
  buildCreatePollPayload,
  clearDraft,
  readDraft,
  writeDraft,
  type PollDraft,
} from '../_services/pollDraftClient'

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

export function useCreatePollStep1() {
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
      setTimeout(() => router.push(COLLECTIVE_TEST_MODE_PATH), 1000)
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

export function useCreatePollStep2() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)
  const [draft] = useState(() => readDraft())
  const [isLastStep, setIsLastStep] = useState(false)

  useEffect(() => {
    if (!draft) {
      router.push(COLLECTIVE_TEST_INFORMATIONS_PATH)
      return
    }

    void getCollectiveTestFlowStatus().then(({ isAuth, hasOrg }) => {
      setIsLastStep(isAuth && hasOrg)
    })
  }, [draft, router])

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
        const draftWithMode = { ...draft, mode: mode as 'standard' | 'scolaire' }
        writeDraft(draftWithMode)

        const { isAuth, hasOrg, orgSlug } = await getCollectiveTestFlowStatus()

        if (!isAuth) {
          router.push(COLLECTIVE_TEST_CONNEXION_PATH)
          return
        }

        if (!hasOrg) {
          router.push(COLLECTIVE_TEST_ORGANISATION_PATH)
          return
        }

        const payload = buildCreatePollPayload(draftWithMode)
        if (!payload || !orgSlug) {
          setIsError(true)
          return
        }

        await createPoll({
          organisationIdOrSlug: orgSlug,
          poll: payload,
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
    isLastStep,
  }
}

export function useFinalizeCollectiveTest(orgSlug: string) {
  const router = useRouter()
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const draft = readDraft()
    if (!draft?.mode) {
      router.replace(COLLECTIVE_TEST_INFORMATIONS_PATH)
    }
  }, [router])

  const finalize = useCallback(() => {
    startTransition(async () => {
      try {
        const draft = readDraft()
        const payload = draft ? buildCreatePollPayload(draft) : null

        if (!payload) {
          router.replace(COLLECTIVE_TEST_INFORMATIONS_PATH)
          return
        }

        await createPoll({
          organisationIdOrSlug: orgSlug,
          poll: payload,
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
  }, [orgSlug, router])

  return { finalize, isPending, isError }
}
