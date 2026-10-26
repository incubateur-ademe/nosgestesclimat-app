'use client'

import Trans from '@/components/translation/trans/TransClient'
import Alert from '@/design-system/alert/Alert'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Organisation } from '@/types/organisations'
import { useCreatePoll } from '../_hooks/useCreatePoll'

interface Props {
  organisation: Organisation
}

export default function PollForm({ organisation }: Props) {
  const { t } = useClientTranslation()
  const { register, unknownError, errors, handleSubmit, isPending } =
    useCreatePoll({
      organisationSlug: organisation.slug,
    })
  return (
    <form
      className="flex flex-col gap-8"
      noValidate
      onSubmit={(e) => {
        if (isPending) {
          e.preventDefault()
          return
        }
        void handleSubmit(e)
      }}
      id="poll-form">
      <TextInput
        label={
          <Trans i18nKey="collectiveTest.form.name.label">
            Choisissez un nom pour votre test collectif
          </Trans>
        }
        placeholder={t(
          'collectiveTest.form.name.placeholder',
          'ex : Défi climat équipe RH, Classe 5ème A…'
        )}
        {...register('name', {
          required: t(
            'collectiveTest.form.name.required',
            'Veuillez renseigner un nom'
          ),
        })}
        error={errors.name?.message}
        data-testid="poll-input"
      />

      <TextInput
        label={
          <p className="mb-0 flex w-full justify-between">
            <span>
              <Trans>Précisez le nombre de participants attendus</Trans>
            </span>
            <span className="text-secondary-700 font-bold">
              <Trans i18nKey="common.facultatif">facultatif</Trans>
            </span>
          </p>
        }
        type="number"
        inputMode="numeric"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          const allowedKeys = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
          ]
          if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
            e.preventDefault()
          }
        }}
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

      {!!unknownError && (
        <Alert
          description={
            <Trans i18nKey="errors.unexpected">
              Une erreur innattendue s'est produite. Veuillez réessayer.
            </Trans>
          }
          type="error"
        />
      )}

      <Button
        type="submit"
        loading={isPending}
        data-testid="poll-form-button"
        form="poll-form"
        className="mt-22 w-full sm:mt-18 sm:w-auto md:self-start">
        <Trans>Créer mon lien de test</Trans>
      </Button>
    </form>
  )
}
