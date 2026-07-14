'use client'

import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { defaultInputStyleClassNames } from '@/design-system/inputs/TextInput'
import Loader from '@/design-system/layout/Loader'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useId,
  useState,
} from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  inputError: string | undefined
  isSuccessValidate: boolean
  isPendingValidate: boolean
  handleValidateVerificationCode: (verificationCode: string) => void
  isInputDisabled: boolean
  onInputChange?: (code: string) => void
}

export default function VerificationCodeForm({
  inputError,
  isSuccessValidate,
  isPendingValidate,
  handleValidateVerificationCode,
  isInputDisabled,
  onInputChange,
}: Props) {
  const inputId = useId()
  const [code, setCode] = useState('')

  const isDisabled = isPendingValidate || isSuccessValidate || isInputDisabled

  const describedBy =
    [
      inputError ? 'verification-error' : null,
      isPendingValidate || isSuccessValidate ? 'verification-status' : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
      setCode(digits)
      onInputChange?.(digits)
    },
    [onInputChange]
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (isDisabled || code.length !== 6) {
        return
      }

      void handleValidateVerificationCode(code)
    },
    [code, handleValidateVerificationCode, isDisabled]
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-120">
      <label htmlFor={inputId} className="mb-4 block font-bold">
        <Trans i18nKey="signIn.verificationForm.codeInput.label">
          Entrez les 6 chiffres du code de vérification
        </Trans>
      </label>

      <input
        id={inputId}
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        value={code}
        onChange={handleChange}
        disabled={isDisabled}
        data-testid="verification-code-input"
        aria-invalid={inputError ? 'true' : 'false'}
        aria-describedby={describedBy}
        placeholder="000000"
        className={twMerge(
          'w-full max-w-120 bg-white! p-4 text-2xl tracking-widest',
          defaultInputStyleClassNames,
          inputError ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : '',
          isSuccessValidate ? 'border-green-700! ring-2 ring-green-700!' : '',
          isDisabled ? 'cursor-not-allowed opacity-50' : '',
          'focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden'
        )}
      />

      {inputError && !isInputDisabled && (
        <p
          id="verification-error"
          className="mt-2 text-sm text-red-800 dark:text-white">
          <Trans i18nKey="signIn.code.invalid">Le code est invalide</Trans>
        </p>
      )}

      {!isSuccessValidate && (
        <Button
          type="submit"
          className="mt-4"
          loading={isPendingValidate}
          disabled={code.length !== 6 || isInputDisabled}
          data-testid="verification-code-submit-button">
          <Trans i18nKey="signIn.verificationForm.submitButton">
            Valider mon code
          </Trans>
        </Button>
      )}

      {isPendingValidate && (
        <div
          id="verification-status"
          className="mt-2 flex items-baseline gap-2 pl-2 text-xs"
          role="status"
          aria-live="polite">
          <Loader color="dark" size="sm" />

          <span>
            <Trans i18nKey="signIn.verificationForm.pending">
              Nous vérifions votre code...
            </Trans>
          </span>
        </div>
      )}

      {isSuccessValidate && (
        <div
          id="verification-status"
          className="mt-4 flex items-baseline gap-2 text-sm"
          role="status"
          aria-live="polite">
          <CheckCircleIcon
            className="h-4 w-4 fill-green-700 dark:fill-green-100"
            aria-hidden="true"
          />

          <span className="text-green-700 dark:text-green-100">
            <Trans i18nKey="signIn.verificationForm.success">
              Votre code est valide !
            </Trans>
          </span>
        </div>
      )}
    </form>
  )
}
