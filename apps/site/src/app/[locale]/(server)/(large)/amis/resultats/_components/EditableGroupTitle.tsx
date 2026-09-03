'use client'

import PencilIcon from '@/components/icons/PencilIcon'

import {
  amisDashboardOpenEditName,
  amisDashboardValidateEditName,
} from '@/constants/tracking/pages/amisDashboard'
import Button from '@/design-system/buttons/Button'
import InlineTextInput from '@/design-system/inputs/InlineTextInput'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { AppUser } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'
import { captureErrorForSentryAndPosthog } from '@/utils/analytics/captureErrorForSentryAndPosthog'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useState, useTransition } from 'react'
import { isGroupOwner } from '../../_helpers/isGroupOwner'
import { updateGroupAction } from '../_actions/update-group.action'

export default function EditableGroupTitle({
  group,
  user,
}: {
  group: Group
  user: AppUser
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { t } = useClientTranslation()

  const isOwner = isGroupOwner(group, user)

  const handleSubmit = (groupNameUpdated: string) => {
    startTransition(async () => {
      try {
        await updateGroupAction({
          groupId: group.id,
          name: groupNameUpdated,
        })
      } catch (e) {
        captureErrorForSentryAndPosthog(e)
      }
    })
  }
  const vousWord = t('Vous')

  return (
    <>
      <div className="mb-4">
        {/*
          `onClose` fires as soon as the transition is started, so keep the
          input mounted while it is pending: the read-only title would
          otherwise repaint with the stale name until the revalidated tree
          lands.
        */}
        {isEditingTitle || isPending ? (
          <InlineTextInput
            defaultValue={group?.name}
            label={t('Modifier le nom du groupe')}
            name="group-name-input"
            onClose={() => {
              setIsEditingTitle(false)
              trackMatomoEvent__deprecated(amisDashboardValidateEditName)
            }}
            onSubmit={handleSubmit}
            isLoading={isPending}
            data-testid="group-edit-input-name"
          />
        ) : (
          <Title
            data-testid="group-name"
            className="text-xl md:text-2xl"
            title={
              <span className="flex items-center justify-between">
                <span>
                  <Emoji>{group?.emoji}</Emoji> <span>{group?.name}</span>
                </span>

                {isOwner ? (
                  <Button
                    className="h-12 w-12 p-1!"
                    aria-label={t('Modifier le nom du groupe')}
                    onClick={() => {
                      setIsEditingTitle(true)
                      trackMatomoEvent__deprecated(amisDashboardOpenEditName)
                    }}
                    color="secondary"
                    data-testid="group-name-edit-button">
                    <PencilIcon className="stroke-primary-700 w-4" />
                  </Button>
                ) : null}
              </span>
            }
            subtitle={t('Créé par {{name}}', {
              name: isOwner ? vousWord : group?.administrator?.name,
            })}
          />
        )}
      </div>
    </>
  )
}
