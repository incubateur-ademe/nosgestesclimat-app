'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { MON_ESPACE_GROUPS_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Title from '@/design-system/layout/Title'
import { useDeleteGroup } from '@/hooks/groups/useDeleteGroup'
import { useFetchGroup } from '@/hooks/groups/useFetchGroup'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Participant } from '@/types/groups'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

export default function SupprimerGroupePage({
  searchParams,
}: {
  searchParams: { groupId: string; userId: string }
}) {
  const router = useRouter()

  const { groupId, userId } = searchParams

  const { data: group, refetch: refetchGroup, isError } = useFetchGroup(groupId)

  const { mutateAsync: deleteUserOrGroupIfOwner, isSuccess } = useDeleteGroup()

  const { t } = useClientTranslation()

  const handleDelete = async () => {
    if (!group) return

    try {
      await deleteUserOrGroupIfOwner({
        groupId,
        userId,
      })

      // Refresh cache
      refetchGroup()
    } catch (error) {
      captureException(error)
    }
  }

  const isOwner = group?.administrator.id === userId

  if (
    !groupId ||
    !userId ||
    (group &&
      group?.participants.findIndex(
        (member: Participant) => member.userId === userId
      ) < 0)
  ) {
    router.push('/')
    return
  }

  if (!groupId) {
    router.push(MON_ESPACE_GROUPS_PATH)
    return
  }

  return (
    <div className="p-4 md:p-8">
      <Title title={t('Supprimer mes données')} />

      {isSuccess && <Trans>Données supprimées.</Trans>}

      {!isSuccess && (
        <p className="my-4">
          {isOwner ? (
            <Trans>
              Supprimer votre groupe <strong>{group?.name}</strong> ? Les
              données sauvegardées seront supprimées pour tous les membres du
              groupe. Cette action est irréversible.
            </Trans>
          ) : (
            <Trans>
              Supprimer vos données de groupe enregistrées ? Seules vos données
              de membre seront supprimées. Cette action est irréversible.
            </Trans>
          )}
        </p>
      )}

      {isError && <DefaultSubmitErrorMessage className="mt-4" />}

      <Button
        disabled={!!isError || !group || isSuccess}
        onClick={handleDelete}>
        <Trans>Supprimer mes données</Trans>
      </Button>
    </div>
  )
}
