'use client'

import Trans from '@/components/translation/trans/TransClient'
import Alert from '@/design-system/alerts/alert/Alert'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Simulation } from '@/helpers/server/model/simulations'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { AppUser } from '@/services/auth/get-user-session'
import { updateGroupParticipant } from '@/services/groups/update-group-participant'
import type { Group } from '@/types/groups'
import { captureException } from '@sentry/nextjs'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  group: Group
  user: AppUser
  /**
   * The user's newest completed simulation, when it postdates the one the group
   * currently uses.
   */
  latestSimulation: Simulation
}

export default function UpdateSimulationUsed({
  group,
  user,
  latestSimulation,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  const router = useRouter()

  const { t } = useClientTranslation()

  const handleUpdateSimulation = () => {
    startTransition(async () => {
      try {
        await updateGroupParticipant({
          groupId: group.id,
          simulation: latestSimulation,
          name:
            group.participants.find((p) => p.userId === user.id)?.name ?? '',
        })

        setIsUpdated(true)

        router.refresh()
      } catch (error) {
        captureException(error)
        setIsError(true)
      }
    })
  }

  const { formattedValue, unit } = formatFootprint(
    latestSimulation.computedResults.carbone.bilan,
    {
      t,
      localize: true,
    }
  )

  if (isError) {
    return (
      <Alert
        data-testid="error-alert"
        aria-live="polite"
        type="error"
        title={<Trans>Oups, une erreur s'est produite</Trans>}
        description={
          <Trans>
            Une erreur s'est produite au moment de mettre à jour votre
            participation. Veuillez réessayer ultérieurement. Si le problème
            persiste, veuillez nous contacter via notre page de contact.
          </Trans>
        }
        onClose={() => {
          setIsError(false)
        }}
      />
    )
  }

  if (isUpdated) {
    return (
      <Alert
        data-testid="success-alert"
        aria-live="polite"
        type="success"
        title={<Trans>Participation mise à jour</Trans>}
        description={
          <Trans>
            Votre participation a bien été mise à jour avec vos résultats de
            test les plus récents.
          </Trans>
        }
        onClose={() => {
          setIsUpdated(false)
        }}
      />
    )
  }

  return (
    <Alert
      data-testid="update-alert"
      title={<Trans>Mettre à jour votre participation au groupe</Trans>}
      description={
        <div className="flex flex-col">
          <p>
            <Trans>
              Vous pouvez mettre à jour le groupe avec votre simulation la plus
              récente réalisée en date du
            </Trans>{' '}
            <strong>{dayjs(latestSimulation.date).format('DD/MM/YYYY')}</strong>{' '}
            <Trans>avec une empreinte carbone de</Trans>{' '}
            <strong>
              {formattedValue} {unit}
            </strong>
            .
          </p>

          <Button
            size="sm"
            className="w-60 self-end"
            disabled={isPending}
            data-testid="update-button"
            onClick={handleUpdateSimulation}>
            {isPending ? (
              <Loader />
            ) : (
              <Trans>Mettre à jour la simulation</Trans>
            )}
          </Button>
        </div>
      }
      className="mb-8"
    />
  )
}
