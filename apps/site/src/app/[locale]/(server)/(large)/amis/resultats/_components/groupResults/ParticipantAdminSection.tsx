'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import type { Group } from '@/types/groups'
import { useActionState, useState } from 'react'
import { findOwnParticipant } from '../../../_helpers/findOwnParticipant'
import { leaveGroupAction } from '../../_actions/leave-group.action'

interface Props {
  group: Group
  user: AppUser
}

export default function ParticipantAdminSection({ group, user }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [, action, isPending] = useActionState(leaveGroupAction, undefined)

  const participant = findOwnParticipant(group, user.id)

  if (!participant) {
    return null
  }

  return (
    <section aria-live="polite">
      <h2>
        <Trans>Quitter</Trans> <Emoji>{group.emoji}</Emoji> {group.name}
      </h2>

      <p className="text-sm md:text-base">
        <Trans>
          Vous pouvez quitter le groupe en cliquant sur le bouton ci-dessous. Le
          groupe ne sera en revanche pas supprimé puisque vous n’en êtes pas
          l’administrateur.
        </Trans>
      </p>

      {isConfirming && (
        <Card className="border-none bg-gray-100">
          <p className="text-sm md:text-base">
            <Trans>
              Cette opération est définitive et vous ne pourrez plus accéder aux
              résultats du groupe.
            </Trans>
          </p>

          <form action={action}>
            <input type="hidden" name="groupId" value={group.id} />
            <input type="hidden" name="participantId" value={participant.id} />

            <div className="flex gap-4">
              <Button
                type="button"
                disabled={isPending}
                color="secondary"
                onClick={() => setIsConfirming(false)}
                size="sm">
                <Trans>Annuler</Trans>
              </Button>

              <Button
                loading={isPending}
                type="submit"
                size="sm"
                color="primary"
                data-testid="button-confirm-leave-group">
                <Trans>Quitter le groupe</Trans>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!isConfirming && (
        <Button
          type="button"
          color="link"
          onClick={() => setIsConfirming(true)}
          data-testid="button-leave-group">
          <Trans>Quitter le groupe</Trans>
        </Button>
      )}
    </section>
  )
}
