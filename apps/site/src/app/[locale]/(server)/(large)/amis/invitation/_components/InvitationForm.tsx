'use client'

import Trans from '@/components/translation/trans/TransClient'
import { TUTORIAL_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import PrenomInput from '@/design-system/inputs/PrenomInput'
import { getLinkToGroupDashboard } from '@/helpers/navigation/groupPages'
import type { Simulation } from '@/helpers/server/model/simulations'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { updateGroupParticipant } from '@/services/groups/updateGroupParticipant'
import type { Group } from '@/types/groups'
import { useRouter } from 'next/navigation'

import { useForm as useReactHookForm } from 'react-hook-form'

interface Inputs {
  guestName: string
}

export default function InvitationForm({
  group,
  currentSimulation,
}: {
  group: Group
  currentSimulation: Simulation
}) {
  const { t } = useClientTranslation()

  const { user, updateName } = useUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<Inputs>()

  const hasCompletedTest = currentSimulation.progression === 1

  const router = useRouter()

  async function onSubmit({ guestName }: Inputs) {
    updateName(guestName)

    await updateGroupParticipant({
      groupId: group.id,
      simulation: currentSimulation,
      userId: user.userId,
      name: guestName,
    })

    if (hasCompletedTest) {
      router.push(getLinkToGroupDashboard({ groupId: group.id }))
    } else {
      router.push(TUTORIAL_PATH)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit) as () => void} autoComplete="off">
      <PrenomInput
        data-testid="member-name"
        value={user.name ?? ''}
        error={errors.guestName?.message}
        {...register('guestName', {
          required: t('Ce champ est requis.'),
        })}
      />

      {!hasCompletedTest && (
        <p className="my-2 text-xs">
          Vous devrez compléter votre test après avoir rejoint le groupe.
        </p>
      )}

      <Button type="submit" data-testid="button-join-group" className="mt-4">
        {hasCompletedTest ? (
          <Trans>Rejoindre</Trans>
        ) : (
          <Trans>Rejoindre et passer mon test</Trans>
        )}
      </Button>
    </form>
  )
}
