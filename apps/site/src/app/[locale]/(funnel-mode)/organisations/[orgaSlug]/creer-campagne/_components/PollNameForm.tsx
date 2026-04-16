'use client'

import { useCreatePollStep1 } from '@/app/[locale]/(funnel-mode)/organisations/[orgaSlug]/creer-campagne/_hooks/useCreatePollStep1'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Organisation } from '@/types/organisations'

interface Props {
  organisation: Organisation
}

export default function PollNameForm({ organisation }: Props) {
  const { t } = useClientTranslation()
  const { register, errors, onSubmit, isPending } = useCreatePollStep1({
    organisationSlug: organisation.slug,
  })

  return (
    <form
      className="flex flex-col gap-8"
      noValidate
      onSubmit={isPending ? () => {} : onSubmit}
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
        data-testid="poll-name-input"
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

      <Button
        type="submit"
        disabled={isPending}
        data-testid="poll-form-name-button"
        form="poll-form"
        className="self-start">
        <Trans i18nKey="common.suivant">Suivant</Trans>
        <span aria-hidden className="ml-2 inline-block">
          →
        </span>
      </Button>
    </form>
  )
}
