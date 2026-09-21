'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { GROUP_EMOJIS } from '@/constants/group'
import Button from '@/design-system/buttons/Button'
import GridRadioInputs from '@/design-system/inputs/GridRadioInputs'
import PrenomInput from '@/design-system/inputs/PrenomInput'
import TextInput from '@/design-system/inputs/TextInput'
import type { Simulation } from '@/helpers/server/model/simulations'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useState, useTransition } from 'react'
import { useForm as useReactHookForm, type Control } from 'react-hook-form'
import { createGroupAction } from '../_actions/create-group.action'

interface Inputs {
  name: string
  administratorName: string
  emoji: string
}

export default function NameForm({
  lastSimulation,
}: {
  lastSimulation: Simulation | undefined
}) {
  const { t } = useClientTranslation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useReactHookForm<Inputs>()

  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)

  function onSubmit({ name, emoji, administratorName }: Inputs) {
    setIsError(false)

    startTransition(async () => {
      const result = await createGroupAction({
        name: name ?? '',
        emoji: emoji ?? '',
        administratorName: administratorName ?? '',
        lastSimulation,
      })

      if (!result.success) {
        setIsError(true)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit) as () => void}
      className="flex flex-col gap-4">
      <PrenomInput
        data-testid="group-input-owner-name"
        error={errors.administratorName?.message}
        {...register('administratorName', {
          required: t('Veuillez entrer votre nom.'),
        })}
      />

      <TextInput
        label={<Trans>Nom du groupe</Trans>}
        helperText={
          <Trans>Pour le retrouver facilement dans votre liste</Trans>
        }
        data-testid="group-name"
        error={errors.name?.message}
        {...register('name', {
          required: t('Ce champ est obligatoire.'),
          maxLength: { value: 50, message: t('Ce champ est trop long') },
        })}
      />

      <GridRadioInputs
        control={control as unknown as Control<Record<string, string | number>>}
        label={<Trans>Illustration du groupe</Trans>}
        helperText={<Trans>Pour faire joli et le reconnaitre !</Trans>}
        name="emoji"
        data-testid="group-select-emoji"
        items={GROUP_EMOJIS.map(({ emoji, label }) => ({
          value: emoji,
          label: emoji,
          ariaLabel: t(label),
        }))}
        rules={{ required: t('Ce champ est obligatoire.') }}
        error={errors.emoji?.message}
      />

      {isError && <DefaultSubmitErrorMessage className="mt-4" />}

      <Button
        type="submit"
        data-testid="button-validate-create-group"
        className="mt-4 self-start"
        disabled={isPending}>
        {lastSimulation ? (
          <Trans>Créer le groupe</Trans>
        ) : (
          <Trans>Créer et passer mon test</Trans>
        )}
      </Button>
    </form>
  )
}
