'use client'

import Trans from '@/components/translation/trans/TransClient'
import UserEmailForm from '@/components/user/UserEmailForm'
import Button from '@/design-system/buttons/Button'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import { useUser } from '@/publicodes-state'
import { useState } from 'react'

export default function UserEmail() {
  const [isEditing, setIsEditing] = useState(false)

  const { user } = useUser()

  if (isEditing) {
    return (
      <UserEmailForm
        submitLabel={
          <Trans i18nKey="mon-espace.settings.userInfos.submitLabel">
            Mettre à jour mes informations
          </Trans>
        }
        className="mb-8"
      />
    )
  }

  function onEditClick() {
    setIsEditing(true)

    setTimeout(() => {
      const emailInput = document.querySelector('input[name="email"]')
      if (emailInput instanceof HTMLInputElement) {
        emailInput.focus()
        emailInput.select()
      }
    }, 100)
  }

  return (
    <div className="flex flex-wrap items-center">
      {user.email ? (
        <p className="m-0 text-sm md:text-base">{user.email}</p>
      ) : (
        <BlockSkeleton className="my-0 h-6 w-[200px]" />
      )}

      <Button
        color="link"
        className="text-base font-bold md:text-lg"
        onClick={onEditClick}>
        <Trans i18nKey="mon-espace.settings.userInfos.editLabel">
          Modifier
        </Trans>
      </Button>
    </div>
  )
}
