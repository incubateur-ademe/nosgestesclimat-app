import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { FocusEvent } from 'react'
import { useRef, useState } from 'react'
import Button from '../buttons/Button'

interface Props {
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  label: string
  onClose: () => void
  onSubmit: (value: string) => void
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

  const handleSubmit = () => {
    const inputValue = inputRef.current?.value

    if (!inputValue) {
      setError(t('Veuillez renseigner un nom.'))
      return
    }

    onSubmit(inputValue)

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
        // onClose()
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
          className={`focus:ring-primary-700 max-w-[30rem] flex-1 rounded-s-md border-2 border-solid border-gray-200 bg-gray-100 !p-4 text-base transition-colors focus:ring-2 focus:ring-offset-3 focus:outline-hidden ${
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
          Ok
        </Button>
      </div>
    </div>
  )
}
