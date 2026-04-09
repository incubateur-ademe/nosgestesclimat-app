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
import { useIsGroupOwner } from '@/hooks/groups/useIsGroupOwner'
import { useUpdateGroup } from '@/hooks/groups/useUpdateGroup'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Group } from '@/types/groups'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { captureException } from '@sentry/nextjs'
import { useState } from 'react'

export default function EditableGroupTitle({ group }: { group: Group }) {
  const formattedGroupId = group.id?.replaceAll('/', '')

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { t } = useClientTranslation()

  const { mutate: updateGroup } = useUpdateGroup()

  const { isGroupOwner } = useIsGroupOwner({ group })

  const handleSubmit = (groupNameUpdated: string) => {
    setIsSubmitting(true)
    try {
      updateGroup({
        groupId: formattedGroupId,
        name: groupNameUpdated,
      })

      setIsSubmitting(false)
      setIsEditingTitle(false)
    } catch (e) {
      captureException(e)
    }
  }
  const vousWord = t('Vous')

  return (
    <>
      <div className="mb-4">
        {isEditingTitle ? (
          <InlineTextInput
            defaultValue={group?.name}
            label={t('Modifier le nom du groupe')}
            name="group-name-input"
            onClose={() => {
              setIsEditingTitle(false)
              trackMatomoEvent__deprecated(amisDashboardValidateEditName)
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
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

                {isGroupOwner ? (
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
              name: isGroupOwner ? vousWord : group?.administrator?.name,
            })}
          />
        )}
      </div>
    </>
  )
}
