'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import { useCreatePoll } from '@/hooks/organisations/polls/useCreatePoll'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Organisation } from '@/types/organisations'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm as useReactHookForm } from 'react-hook-form'
import { revalidationOrganisationPath } from './actions/revalidationOrganisationPath'

interface Props {
  organisation: Organisation
}

interface Inputs {
  name: string
  expectedNumberOfParticipants: number
}

export default function PollForm({ organisation }: Props) {
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

  async function onSubmit({ expectedNumberOfParticipants, name }: Inputs) {
    try {
      const pollCreated = await createPoll({
        name,
        expectedNumberOfParticipants: expectedNumberOfParticipants || undefined,
      })

      revalidationOrganisationPath(organisation.slug)

      router.push(
        `/organisations/${organisation.slug}/campagnes/${pollCreated.slug}`
      )
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
            label={<Trans>Nom de la campagne</Trans>}
            placeholder={t('ex : Campagne 2024, Classe de 6ème A, etc.')}
            {...register('name', {
              required: t('Ce champ est requis'),
            })}
            error={errors.name?.message}
            data-testid="poll-name-input"
          />

          <TextInput
            label={
              <p className="mb-0 flex w-full justify-between">
                <span>
                  <Trans>Nombre de participants attendus</Trans>
                </span>{' '}
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
            Une erreur s'est produite lors de la création de la campagne.
            Veuillez réessayer.
          </Trans>
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        data-testid="poll-create-button"
        form="poll-form"
        className="mt-4 self-start">
        <Trans>Lancer ma campagne</Trans>
      </Button>
    </>
  )
}
