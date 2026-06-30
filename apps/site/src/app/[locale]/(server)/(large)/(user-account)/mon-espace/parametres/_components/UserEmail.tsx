'use client'

import Trans from '@/components/translation/trans/TransClient'
import UserEmailForm from '@/components/user/UserEmailForm'
import Button from '@/design-system/buttons/Button'
import { UserProvider } from '@/publicodes-state'
import type { AuthUser } from '@/services/auth/get-user-session'
import { useState } from 'react'
interface Props {
  user: AuthUser
}
export default function UserEmail({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <UserProvider userSession={user}>
        <UserEmailForm
          defaultEmail={user.email}
          submitLabel={
            <Trans i18nKey="mon-espace.settings.userInfos.submitLabel">
              Mettre à jour mes informations
            </Trans>
          }
          className="mb-8"
        />
      </UserProvider>
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
      <p className="m-0 text-sm md:text-base">{user.email}</p>

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
