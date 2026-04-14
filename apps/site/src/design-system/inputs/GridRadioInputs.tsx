import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import { onKeyDownHelper } from '@/helpers/accessibility/onKeyDownHelper'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { ChangeEventHandler, HTMLAttributes, ReactNode } from 'react'
import { Controller, type Control, type RegisterOptions } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { defaultInputStyleClassNames } from './TextInput'

interface Props {
  name: string
  label?: string | ReactNode
  type?: string
  items: {
    value: string
    label: string | ReactNode
    ariaLabel: string
  }[]
  isInvalid?: boolean
  error?: string
  helperText?: string | ReactNode
  className?: string
  containerClassName?: string
  placeholder?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  value?: string | number
  required?: boolean
  maxLength?: number
  disabled?: boolean
  control: Control<Record<string, string | number>>
  rules?: RegisterOptions
  'data-testid'?: string
}

export default function GridRadioInputs({
  name,
  label,
  error,
  items,
  helperText,
  containerClassName,
  value,
  control,
  rules,
  'data-testid': dataCypressId,
}: HTMLAttributes<HTMLInputElement> & Props) {
  const { t } = useClientTranslation()
  return (
    <div
      className={twMerge(
        'flex w-full max-w-[30rem] flex-col items-start',
        containerClassName
      )}
      aria-live="polite">
      {label ? (
        <label htmlFor={name} className="w-full">
          <span
            className={`font-bold text-slate-900 ${
              error ? 'text-red-700!' : ''
            }`}>
            {label}
          </span>
        </label>
      ) : null}

      {helperText ? (
        <span className="mt-1 mb-4 text-sm text-slate-600">{helperText}</span>
      ) : null}

      <Controller
        control={control}
        name={name}
        defaultValue={value ?? ''}
        rules={rules ?? undefined}
        render={({ field: { onChange, value, ...props } }) => {
          return (
            <fieldset className="grid w-full grid-cols-4 gap-2 sm:grid-cols-5">
              <legend className="sr-only">{label}</legend>

              {items?.map((item) => {
                // Style the radio to look like a button
                // hiding the actual radio button
                // and adding a border and padding to the label
                // add a bg color to the selected radio based on css checked pseudo class
                return (
                  <label
                    key={item.value}
                    data-testid={dataCypressId + '-' + item.value}
                    aria-label={item.ariaLabel}
                    title={`${item.ariaLabel} - ${value === item.value ? t('Sélectionné') : t('Sélectionner cette option')}`}
                    className={twMerge(
                      'focus-within:ring-primary-700 relative flex cursor-pointer items-center justify-center rounded-xl p-6 text-xl focus-within:ring-2',
                      defaultInputStyleClassNames,
                      'hover:bg-primary-50 hover:border-gray-300 focus:border-slate-300',
                      value === item.value
                        ? 'border-primary-700! bg-primary-50!'
                        : ''
                    )}>
                    {value === item.value && (
                      <CheckCircleIcon className="fill-primary-700 absolute right-1 bottom-1" />
                    )}

                    <input
                      type="radio"
                      className="sr-only"
                      tabIndex={0}
                      onChange={() => {
                        onChange(item.value)
                      }}
                      onKeyDown={onKeyDownHelper(() => onChange(item.value))}
                      {...props}
                    />
                    {item.label}
                  </label>
                )
              })}
            </fieldset>
          )
        }}
      />

      {error && (
        <span id={`error-${name}`} className="mt-2 text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  )
}
