'use client'

import Trans from '@/components/translation/trans/TransClient'
import { MON_ESPACE_GROUPS_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import { useRemoveParticipant } from '@/hooks/groups/useRemoveParticipant'
import { useUser } from '@/publicodes-state'
import type { Group } from '@/types/groups'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  group: Group
}

export default function ParticipantAdminSection({ group }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)

  const { mutateAsync: removePartipant, isSuccess } = useRemoveParticipant()

  const {
    user: { userId },
  } = useUser()

  const router = useRouter()

  const timeoutRef = useRef<NodeJS.Timeout>(undefined)

  async function handleDelete() {
    const participant = group.participants.find((p) => p.userId === userId)

    if (!participant) return

    try {
      await removePartipant({
        participantId: participant.id,
        groupId: group.id,
        userId,
      })

      timeoutRef.current = setTimeout(() => {
        router.push(MON_ESPACE_GROUPS_PATH)
      }, 1750)
    } catch (error) {
      captureException(error)
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <section>
      <h2>
        <Trans>Quitter</Trans> <Emoji>{group?.emoji}</Emoji> {group?.name}
      </h2>

      <p className="text-sm md:text-base">
        <Trans>
          Vous pouvez quitter le groupe en cliquant sur le bouton ci-dessous. Le
          groupe ne sera en revanche pas supprimé puisque vous n’en êtes pas
          l’administrateur.
        </Trans>
      </p>

      {isConfirming && !isSuccess && (
        <Card className="border-none bg-gray-100">
          <p className="text-sm md:text-base">
            <Trans>
              Cette opération est définitive et vous ne pourrez plus accéder aux
              résultats du groupe.
            </Trans>
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsConfirming(false)}
              size="sm"
              color="secondary">
              Annuler
            </Button>

            <Button
              onClick={handleDelete}
              size="sm"
              color="primary"
              data-testid="button-confirm-leave-group">
              Quitter le groupe
            </Button>
          </div>
        </Card>
      )}

      {!isConfirming && !isSuccess && (
        <Button
          color="link"
          onClick={() => setIsConfirming(true)}
          data-testid="button-leave-group">
          Quitter le groupe
        </Button>
      )}

      {isSuccess && (
        <Card className="border-none bg-gray-100">
          <p className="text-sm md:text-base">
            <Trans>
              Vous avez quitté ce groupe. Vous allez être redirigé vers la page
              d'accueil du mode groupe
            </Trans>
          </p>
        </Card>
      )}
    </section>
  )
}
