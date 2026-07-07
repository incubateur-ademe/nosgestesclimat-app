'use client'

import { marianne } from '@/app/[locale]/marianne'
import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import Trans from '@/components/translation/trans/TransClient'

import Loader from '@/design-system/layout/Loader'
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import VerificationInput from 'react-verification-input'
import { twMerge } from 'tailwind-merge'

interface Props {
  inputError: string | undefined
  isSuccessValidate: boolean
  isPendingValidate: boolean
  handleValidateVerificationCode: (verificationCode: string) => Promise<void>
  isInputDisabled: boolean
  onInputChange?: (code: string) => void
}

export default function VerificationCodeInput({
  inputError,
  isSuccessValidate,
  isPendingValidate,
  handleValidateVerificationCode,
  isInputDisabled,
  onInputChange,
}: Props) {
  const isDisabled = isPendingValidate || isSuccessValidate || isInputDisabled

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">
        <Trans>Entrez votre code de vérification pour continuer</Trans>
      </legend>
      <VerificationInput
        length={6}
        inputProps={
          {
            autoComplete: 'one-time-code webauthn',
            'data-testid': 'verification-code-input',
            'aria-label': 'Entrez votre code de vérification pour continuer',
            'aria-describedby':
              [
                inputError ? 'verification-error' : null,
                isPendingValidate ? 'verification-status' : null,
                isSuccessValidate ? 'verification-status' : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined,
            'aria-invalid': inputError ? 'true' : 'false',
            disabled: isDisabled,
          } as DetailedHTMLProps<
            InputHTMLAttributes<HTMLInputElement>,
            HTMLInputElement
          >
        }
        classNames={{
          container: 'container max-w-full w-3xs md:w-80',
          character: twMerge(
            'border-2! border-slate-500! rounded-xl w-8 text-primary-700! font-medium',
            marianne.className,
            inputError ? 'border-red-700! border-2' : '',
            isSuccessValidate ? 'border-green-700! border-2' : '',
            isDisabled ? 'bg-slate-100! cursor-not-allowed' : ''
          ),
          characterInactive: 'text-transparent',
          characterSelected: 'character--selected',
          characterFilled: 'text-primary-700!',
        }}
        placeholder=""
        onChange={(code) => {
          onInputChange?.(code)

          if (code.length !== 6) {
            return
          }

          handleValidateVerificationCode(code).catch(() => {
            // Error handled by error state of useMutation
          })
        }}
      />

      {inputError && !isInputDisabled && (
        <div>
          <p
            id="verification-error"
            className="mt-2 text-sm text-red-800 dark:text-white">
            <Trans>Le code est invalide</Trans>
          </p>
        </div>
      )}

      {isPendingValidate && (
        <div
          id="verification-status"
          className="mt-2 flex items-baseline gap-2 pl-2 text-xs"
          role="status"
          aria-live="polite">
          <Loader color="dark" size="sm" />

          <span>
            <Trans>Nous vérifions votre code...</Trans>
          </span>
        </div>
      )}

      {isSuccessValidate && (
        <div
          id="verification-status"
          className="mt-4 flex items-baseline gap-2 pl-2 text-sm"
          role="status"
          aria-live="polite">
          <CheckCircleIcon
            className="h-4 w-4 fill-green-700 dark:fill-green-100"
            aria-hidden="true"
          />

          <span className="text-green-700 dark:text-green-100">
            <Trans>Votre code est valide !</Trans>
          </span>
        </div>
      )}
    </fieldset>
  )
}
