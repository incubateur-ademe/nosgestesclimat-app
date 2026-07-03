'use client'

import Trans from '@/components/translation/trans/TransClient'
import {
  amisDashboardOpenDeleteGroup,
  amisDashboardValidateDeleteGroup,
} from '@/constants/tracking/pages/amisDashboard'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import type { Group } from '@/types/groups'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useActionState, useState } from 'react'
import { deleteGroupAction } from '../../_actions/delete-group.action'

interface Props {
  group: Group
}

export default function OwnerAdminSection({ group }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [, action, pending] = useActionState(deleteGroupAction, undefined)

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

      {isConfirming && (
        <Card className="border-none bg-gray-100">
          <p className="text-sm md:text-base">
            <Trans>
              Cette opération est définitive et supprimera le groupe pour tous
              ses membres.
            </Trans>
          </p>

          <form
            action={action}
            onSubmit={() =>
              trackMatomoEvent__deprecated(amisDashboardOpenDeleteGroup)
            }>
            <input type="hidden" name="groupId" value={group?.id} />

            <div className="flex gap-4">
              <Button
                disabled={pending}
                color="secondary"
                onClick={() => {
                  setIsConfirming(false)
                }}
                size="sm">
                <Trans>Annuler</Trans>
              </Button>

              <Button
                loading={pending}
                type="submit"
                size="sm"
                color="primary"
                data-testid="button-confirm-delete-group">
                <Trans>Supprimer</Trans>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!isConfirming && (
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
    </section>
  )
}
