'use client'

import {
  AuthProvider,
  useAuthContext,
} from '@/components/authentication/authenticateUserForm/AuthContext'
import VerifyCodeForm from '@/components/authentication/authenticateUserForm/VerifyCodeForm'
import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { captureClickUpdateUserEmail } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import TextInput from '@/design-system/inputs/TextInput'
import Loader from '@/design-system/layout/Loader'
import Modal from '@/design-system/modals/Modal'
import { useUpdateUserSettings } from '@/hooks/settings/useUpdateUserSettings'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { formatEmail } from '@/utils/format/formatEmail'
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
}

export default function UserEmailForm({
  submitLabel,
  className,
  defaultEmail,
  resetLocalState,
}: Props) {
  const router = useRouter()

  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const handleOnComplete = useCallback(() => {
    setShowVerificationModal(false)
    router.refresh()
    resetLocalState()
  }, [router, resetLocalState])

  return (
    <AuthProvider onComplete={handleOnComplete}>
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
  const { sendEmail } = useAuthContext()

  const { register, handleSubmit } = useReactHookForm<Inputs>({
    defaultValues: { email: defaultEmail },
  })

  const updateUserSettings = useUpdateUserSettings()

  const createCodeIfEmailChanged: SubmitHandler<Inputs> = (data) => {
    trackPosthogEvent(captureClickUpdateUserEmail)
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
          <Modal
            ariaLabel={t(
              'organisations.emailVerificationModal.title',
              "Fenêtre modale de confirmation d'e-mail"
            )}
            isOpen
            closeModal={onCloseVerification}
            hasAbortCross={false}>
            <VerifyCodeForm email={pendingEmail} />
          </Modal>
        )}

        <TextInput
          label={t('Votre adresse e-mail')}
          className="w-full"
          autoComplete="email"
          {...register('email')}
        />

        {updateUserSettings.isSuccess && (
          <p
            data-testid="success-message"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-4 mb-4 text-green-700">
            <Trans>Vos informations ont bien été mises à jour.</Trans>
          </p>
        )}

        {updateUserSettings.isError && (
          <div data-testid="error-message">
            <DefaultSubmitErrorMessage />
          </div>
        )}

        <div>
          <Button
            data-testid="submit-button"
            type="submit"
            className="mt-6 gap-2 self-start"
            disabled={updateUserSettings.isPending}>
            {updateUserSettings.isPending && <Loader size="sm" color="light" />}
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
