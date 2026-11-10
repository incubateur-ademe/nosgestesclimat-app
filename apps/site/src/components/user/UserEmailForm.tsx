'use client'

import { AuthProvider, useAuth } from '@/components/authentication/AuthProvider'
import VerifyCodeForm from '@/components/authentication/authenticateUserForm/VerifyCodeForm'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/design-system/shadcn/dialog'
import { useUpdateUserSettings } from '@/hooks/settings/useUpdateUserSettings'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { formatEmail } from '@/utils/format/formatEmail'
import { success } from '@nosgestesclimat/core/lib/result'
import { useRouter } from 'next/navigation'
import { useCallback, useState, type ReactNode } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm as useReactHookForm } from 'react-hook-form'

interface Inputs {
  email?: string
}

interface Props {
  submitLabel?: string | ReactNode
  className?: string
  defaultEmail: string
  resetLocalState: () => void
  /** The address the account now carries, once the change is verified. */
  onUpdated: (email: string) => void
}

export default function UserEmailForm({
  submitLabel,
  className,
  defaultEmail,
  resetLocalState,
  onUpdated,
}: Props) {
  const router = useRouter()
  const { mutateAsync: updateEmail } = useUpdateUserSettings()

  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const verify = useCallback(
    async (email: string, code: string) => {
      const r = await updateEmail({ email, code })
      return success({ userId: r.userId, id: r.userId })
    },
    [updateEmail]
  )

  const handleOnComplete = useCallback(
    ({ email }: { email: string }) => {
      setShowVerificationModal(false)
      // The parent gives way to the display: the success message lives there,
      // so it outlives the form.
      onUpdated(email)
      router.refresh()
    },
    [onUpdated, router]
  )

  return (
    <AuthProvider verify={verify} onComplete={handleOnComplete}>
      <UserEmailFormContent
        submitLabel={submitLabel}
        className={className}
        defaultEmail={defaultEmail}
        showVerificationModal={showVerificationModal}
        pendingEmail={pendingEmail}
        onOpenVerification={(email: string) => {
          setPendingEmail(email)
          setShowVerificationModal(true)
        }}
        onCloseVerification={() => {
          setShowVerificationModal(false)
          resetLocalState()
        }}
      />
    </AuthProvider>
  )
}

function UserEmailFormContent({
  submitLabel,
  className,
  defaultEmail,
  showVerificationModal,
  pendingEmail,
  onOpenVerification,
  onCloseVerification,
}: {
  submitLabel?: string | ReactNode
  className?: string
  defaultEmail: string
  showVerificationModal: boolean
  pendingEmail: string
  onOpenVerification: (email: string) => void
  onCloseVerification: () => void
}) {
  const { t } = useClientTranslation()
  const { sendEmail, reset } = useAuth()

  const { register, handleSubmit } = useReactHookForm<Inputs>({
    defaultValues: { email: defaultEmail },
  })

  const createCodeIfEmailChanged: SubmitHandler<Inputs> = (data) => {
    const nextEmail = formatEmail(data.email)

    if (nextEmail && nextEmail !== defaultEmail) {
      onOpenVerification(nextEmail)
      void sendEmail(nextEmail)
    }
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit(createCodeIfEmailChanged)}
        className="flex w-full flex-col items-start gap-4">
        {showVerificationModal && pendingEmail && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) {
                reset()
                onCloseVerification()
              }
            }}>
            <DialogContent
              aria-label={t(
                'organisations.emailVerificationModal.title',
                "Fenêtre modale de confirmation d'e-mail"
              )}
              showCloseButton={false}>
              <DialogHeader>
                <VerifyCodeForm />
              </DialogHeader>

              <DialogFooter showCancelButton />
            </DialogContent>
          </Dialog>
        )}

        <TextInput
          label={t('Votre adresse e-mail')}
          className="w-full"
          autoComplete="email"
          {...register('email')}
        />

        <div>
          <Button
            data-testid="submit-button"
            type="submit"
            className="gap-2 self-start">
            {submitLabel ? (
              <span data-testid="custom-submit-label">{submitLabel}</span>
            ) : (
              <span data-testid="default-submit-label">
                <Trans i18nKey="userParams.updateInfo">
                  Mettre à jour mes coordonnées
                </Trans>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
