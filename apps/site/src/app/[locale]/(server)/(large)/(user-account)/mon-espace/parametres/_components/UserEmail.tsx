'use client'

import Trans from '@/components/translation/trans/TransClient'
import UserEmailForm from '@/components/user/UserEmailForm'
import Button from '@/design-system/buttons/Button'
import { UserProvider } from '@/publicodes-state'
import type { AuthUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { useCallback, useState } from 'react'
interface Props {
  user: AuthUser
}
export default function UserEmail({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [updatedEmail, setUpdatedEmail] = useState<string | null>(null)
  const resetLocalState = useCallback(() => setIsEditing(false), [])

  // Shown straight away rather than after the refresh that brings the new
  // address, so the display never falls back to the old one.
  const onUpdated = useCallback((email: string) => {
    setIsEditing(false)
    setUpdatedEmail(email)
  }, [])

  if (isEditing) {
    return (
      <UserProvider userSession={user}>
        <UserEmailForm
          defaultEmail={user.email}
          resetLocalState={resetLocalState}
          onUpdated={onUpdated}
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
    setUpdatedEmail(null)

    setTimeout(() => {
      const emailInput = document.querySelector('input[name="email"]')
      if (emailInput instanceof HTMLInputElement) {
        emailInput.focus()
        emailInput.select()
      }
    }, 100)
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center">
        <p className="m-0 text-sm md:text-base" data-testid="user-email-display">
          {updatedEmail ?? user.email}
        </p>

        <Button
          variant="link"
          className="text-base font-bold md:text-lg"
          data-testid="edit-email-button"
          onClick={onEditClick}>
          <Trans i18nKey="mon-espace.settings.userInfos.editLabel">
            Modifier
          </Trans>
        </Button>
      </div>

      {updatedEmail && (
        <p
          data-testid="success-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 mb-0 text-green-700">
          <Trans>Vos informations ont bien été mises à jour.</Trans>
        </p>
      )}
    </div>
  )
}
