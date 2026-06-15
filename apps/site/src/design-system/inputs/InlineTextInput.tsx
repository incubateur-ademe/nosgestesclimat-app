'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { FocusEvent } from 'react'
import { useRef, useState } from 'react'
import Button from '../buttons/Button'
import Loader from '../layout/Loader'

interface Props {
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  label: string
  onClose: () => void
  onSubmit: (value: string) => Promise<void>
  isLoading?: boolean
}

export default function InlineTextInput({
  name,
  type = 'text',
  placeholder,
  defaultValue,
  label,
  onClose = () => {},
  onSubmit,
  isLoading,
  ...props
}: Props) {
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const { t } = useClientTranslation()

  const handleSubmit = async () => {
    const inputValue = inputRef.current?.value

    if (!inputValue) {
      setError(t('Veuillez renseigner un nom.'))
      return
    }

    await onSubmit(inputValue)

    onClose()
  }

  return (
    <div
      className="flex flex-col"
      aria-live="polite"
      onBlurCapture={(event: FocusEvent) => {
        if (event?.relatedTarget?.id === 'inline-input-button') {
          return
        }
      }}>
      <label htmlFor={name} className="mb-2">
        <span
          className={`text-sm font-bold text-slate-900 ${
            error ? 'text-red-700!' : ''
          }`}>
          {label}
        </span>
      </label>
      <div className="flex items-stretch">
        <input
          ref={inputRef}
          name={name}
          type={type}
          autoComplete="off"
          placeholder={placeholder}
          className={`focus-visible:ring-primary-700 max-w-120 flex-1 rounded-s-md border-2 border-solid border-gray-200 bg-gray-100 p-4 text-base transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-3 ${
            error ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : ''
          }`}
          aria-describedby={`error-${name}`}
          defaultValue={defaultValue}
          // We alert the user when focusing the button that
          // display the input

          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          disabled={isLoading}
          {...props}
        />
        <Button
          className="border-primary-700! rounded-s-none border-2!"
          id="inline-input-button"
          onClick={handleSubmit}
          aria-label={t('Ok, sauvegarder la modification')}
          disabled={isLoading}
          data-testid="button-inline-input">
          {isLoading ? (
            <Loader size="sm" color="dark" className="mr-2" />
          ) : null}
          Ok
        </Button>
      </div>
    </div>
  )
}
