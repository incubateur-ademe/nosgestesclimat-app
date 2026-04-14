'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import { useCreatePoll } from '@/hooks/organisations/polls/useCreatePoll'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Organisation } from '@/types/organisations'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm as useReactHookForm } from 'react-hook-form'
import { POLL_DATA_KEY } from '../_constants/sessionStorage'

interface Props {
  organisation: Organisation
}

interface Inputs {
  name: string
  expectedNumberOfParticipants: number
}

export default function PollNameForm({ organisation }: Props) {
  const router = useRouter()

  const { t } = useClientTranslation()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useReactHookForm<Inputs>()

  const {
    mutateAsync: createPoll,
    isError,
    isPending,
  } = useCreatePoll(organisation.slug)

  // async function onSubmit({ expectedNumberOfParticipants, name }: Inputs) {
  //   try {
  //     const pollCreated = await createPoll({
  //       name,
  //       expectedNumberOfParticipants: expectedNumberOfParticipants || undefined,
  //     })

  //     revalidationOrganisationPath(organisation.slug)

  //     router.push(
  //       `/organisations/${organisation.slug}/campagnes/${pollCreated.slug}`
  //     )
  //   } catch (error) {
  //     captureException(error)
  //   }
  // }

  async function onSubmit(data: Inputs) {
    try {
      safeSessionStorage.setItem(
        POLL_DATA_KEY,
        JSON.stringify({
          data,
        })
      )

      // Go to step 2
      router.push(`/organisations/${organisation.slug}/creer-campagne/type`)
    } catch (error) {
      captureException(error)
    }
  }

  return (
    <>
      <form
        onSubmit={isPending ? () => {} : handleSubmit(onSubmit)}
        id="poll-form">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label={
              <Trans i18nKey="collectiveTest.form.name.label">
                Choisissez un nom pour votre test collectif
              </Trans>
            }
            placeholder={t('ex : Défi climat équipe RH, Classe 5ème A…')}
            {...register('name', {
              required: t('Veuillez renseigner un nom'),
            })}
            error={errors.name?.message}
            data-testid="poll-name-input"
          />

          <TextInput
            label={
              <p className="mb-0 flex w-full justify-between">
                <span>
                  <Trans>Précisez le nombre de participants attendus</Trans>
                </span>
                <span className="text-secondary-700 font-bold italic">
                  <Trans>facultatif</Trans>
                </span>
              </p>
            }
            type="number"
            {...register('expectedNumberOfParticipants', {
              valueAsNumber: true,
              min: {
                value: 1,
                message: t('Le nombre de participants doit être supérieur à 0'),
              },
            })}
            error={errors.expectedNumberOfParticipants?.message}
            data-testid="poll-expected-number-of-participants-input"
          />
        </div>
      </form>

      {isError && (
        <p className="mt-2 text-red-800">
          <Trans>
            Une erreur s'est produite lors de la création de votre test
            collectif. Veuillez réessayer.
          </Trans>
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        data-testid="poll-form-name-button"
        form="poll-form"
        className="mt-4 self-start">
        <Trans>Suivant</Trans>
        <span aria-hidden>→</span>
      </Button>
    </>
  )
}
