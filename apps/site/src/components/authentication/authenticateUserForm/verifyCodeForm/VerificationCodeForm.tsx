'use client'

import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { defaultInputStyleClassNames } from '@/design-system/inputs/TextInput'
import Loader from '@/design-system/layout/Loader'
import { type ChangeEvent, type FormEvent, useCallback, useId, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '@/components/authentication/AuthProvider'
import { useClientTranslation } from '@/hooks/useClientTranslation'

export default function VerificationCodeForm() {
  const { state, submitCode, clearCodeError } = useAuth()
  const { t } = useClientTranslation()
  const [code, setCode] = useState('')
  const inputId = useId()

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
      setCode(digits)
      clearCodeError()
    },
    [clearCodeError]
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (state.phase === 'code_sent' && code.length === 6 && !state.isResending && !state.codeError) {
        submitCode(code)
      }
    },
    [state, code, submitCode]
  )

  if (state.phase === 'idle' || state.phase === 'email_sending') {
    return null
  }

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
        data-testid="verification-code-input"
        value={code}
        onChange={handleChange}
        disabled={state.phase !== 'code_sent' || state.isResending}
        aria-invalid={state.phase === 'code_sent' && !!state.codeError ? 'true' : 'false'}
        placeholder="000000"
        className={twMerge(
          'w-full max-w-120 bg-white! p-4 text-2xl tracking-widest',
          defaultInputStyleClassNames,
          state.phase === 'code_sent' && state.codeError
            ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : '',
          state.phase === 'authenticated'
            ? 'border-green-700! ring-2 ring-green-700!' : '',
          (state.phase !== 'code_sent' || state.isResending)
            ? 'cursor-not-allowed' : '',
          'focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden'
        )}
      />

      {state.phase === 'code_sent' && state.codeError && (
        <p id="verification-error" className="mt-2 text-sm text-red-800 dark:text-white">
          {state.codeError === 'invalid'
            ? t('signIn.code.invalid', 'Le code est invalide')
            : state.codeError === 'rate_limited'
            ? t('signIn.code.rateLimited', 'Veuillez patienter un instant avant de réessayer.')
            : t('common.errors.errorHappened', 'Une erreur est survenue. Veuillez réessayer.')}
        </p>
      )}

      {state.phase === 'code_sent' && (
        <Button
          type="submit"
          className="mt-4"
          disabled={code.length !== 6 || state.isResending || state.codeError !== null}
          data-testid="verification-code-submit-button">
          <Trans i18nKey="signIn.verificationForm.submitButton">Valider mon code</Trans>
        </Button>
      )}

      {state.phase === 'verifying_code' && (
        <div id="verification-status" role="status" aria-live="polite"
          className="mt-2 flex items-baseline gap-2 pl-2 text-xs">
          <Loader color="dark" size="sm" />
          <span><Trans i18nKey="signIn.verificationForm.pending">Nous vérifions votre code...</Trans></span>
        </div>
      )}

      {state.phase === 'authenticated' && (
        <div id="verification-status" role="status" aria-live="polite"
          className="mt-4 flex items-baseline gap-2 text-sm">
          <CheckCircleIcon className="h-4 w-4 fill-green-700 dark:fill-green-100" aria-hidden="true" />
          <span className="text-green-700 dark:text-green-100">
            <Trans i18nKey="signIn.verificationForm.success">Votre code est valide !</Trans>
          </span>
        </div>
      )}
    </form>
  )
}
