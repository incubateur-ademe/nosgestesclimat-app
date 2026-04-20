'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { GROUP_EMOJIS } from '@/constants/group'
import { amisCreationEtapeVotreGroupeSuivant } from '@/constants/tracking/pages/amisCreation'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import GridRadioInputs from '@/design-system/inputs/GridRadioInputs'
import PrenomInput from '@/design-system/inputs/PrenomInput'
import TextInput from '@/design-system/inputs/TextInput'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { AuthUser } from '@/helpers/server/model/user'
import { useCreateGroup } from '@/hooks/groups/useCreateGroup'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm as useReactHookForm, type Control } from 'react-hook-form'

interface Inputs {
  name: string
  administratorName: string
  emoji: string
}

export default function NameForm({
  user,
  lastSimulation,
}: {
  user: AuthUser
  lastSimulation: Simulation | undefined
}) {
  const { t } = useClientTranslation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useReactHookForm<Inputs>()

  const {
    mutateAsync: createGroup,
    isPending,
    isSuccess,
    isError,
  } = useCreateGroup()

  const router = useRouter()

  const currentSimulation = useCurrentSimulation()

  async function onSubmit({ name, emoji, administratorName }: Inputs) {
    try {
      const group = await createGroup({
        groupInfo: {
          name: name ?? '',
          emoji: emoji ?? '',
          administrator: {
            userId: user.id,
            name: administratorName ?? '',
            email: user.email,
          },
          participants: lastSimulation
            ? [{ simulation: lastSimulation }]
            : undefined,
        },
      })

      // Update current simulation with group id (to redirect after test completion)
      currentSimulation.update({
        groupToAdd: group.id,
      })

      trackMatomoEvent__deprecated(amisCreationEtapeVotreGroupeSuivant)

      if (lastSimulation) {
        router.push('/amis/resultats?groupId=' + group.id)
      } else {
        // @TOFIX The simulation is really created ?
        router.push(SIMULATOR_PATH)
      }
    } catch (e) {
      captureException(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        disabled={isPending || isSuccess}>
        {lastSimulation ? (
          <Trans>Créer le groupe</Trans>
        ) : (
          <Trans>Créer et passer mon test</Trans>
        )}
      </Button>
    </form>
  )
}
