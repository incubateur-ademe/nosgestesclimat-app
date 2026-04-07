'use client'

import Trans from '@/components/translation/trans/TransClient'
import {
  amisDashboardOpenDeleteGroup,
  amisDashboardValidateDeleteGroup,
} from '@/constants/tracking/pages/amisDashboard'
import { MON_ESPACE_GROUPS_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import { useDeleteGroup } from '@/hooks/groups/useDeleteGroup'
import { useUser } from '@/publicodes-state'
import type { Group } from '@/types/groups'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  group: Group
}

export default function OwnerAdminSection({ group }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)

  const { mutateAsync: deleteUserOrGroupIfOwner, isSuccess } = useDeleteGroup({
    shouldInvalidateQueries: false,
  })

  const { user } = useUser()

  const router = useRouter()

  const timeoutRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleDelete() {
    trackMatomoEvent__deprecated(amisDashboardOpenDeleteGroup)
    if (!group) return

    try {
      await deleteUserOrGroupIfOwner({
        groupId: group.id,
        userId: user.userId,
      })
      router.refresh()

      timeoutRef.current = setTimeout(() => {
        router.push(MON_ESPACE_GROUPS_PATH)
      }, 2000)
    } catch (error) {
      captureException(error)
    }
  }

  return (
    <section className="my-6" aria-live="polite">
      <h2 className="md:text-lg">
        <Trans>Supprimer</Trans> <Emoji>{group?.emoji}</Emoji> {group?.name}
      </h2>

      <p className="text-sm md:text-base">
        <Trans>
          Vous pouvez supprimer le groupe en cliquant sur le bouton ci-dessous.
          Il sera supprimé définitivement pour tous ses autres membres puisque
          vous en êtes l'administrateur.
        </Trans>
      </p>

      {isConfirming && !isSuccess && (
        <Card className="border-none bg-gray-100">
          <p className="text-sm md:text-base">
            <Trans>
              Cette opération est définitive et supprimera le groupe pour tous
              ses membres.
            </Trans>
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setIsConfirming(false)
              }}
              size="sm"
              color="secondary">
              <Trans>Annuler</Trans>
            </Button>

            <Button
              onClick={handleDelete}
              size="sm"
              color="primary"
              data-testid="button-confirm-delete-group">
              <Trans>Supprimer</Trans>
            </Button>
          </div>
        </Card>
      )}

      {!isConfirming && !isSuccess && (
        <Button
          color="link"
          onClick={() => {
            trackMatomoEvent__deprecated(amisDashboardValidateDeleteGroup)
            setIsConfirming(true)
          }}
          data-testid="button-delete-group">
          <Trans>Supprimer le groupe</Trans>
        </Button>
      )}

      {isSuccess && (
        <Card className="border-none bg-gray-100">
          <p className="mb-0 text-sm md:text-base">
            <Trans>
              Votre groupe a été supprimé. Vous allez être redirigé vers la page
              d'accueil du mode groupe.
            </Trans>
          </p>
        </Card>
      )}
    </section>
  )
}
