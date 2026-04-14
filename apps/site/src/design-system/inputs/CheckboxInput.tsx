'use client'

import Trans from '@/components/translation/trans/TransClient'
import { onKeyDownHelper } from '@/helpers/accessibility/onKeyDownHelper'
import type { ComponentPropsWithRef, ForwardedRef, ReactNode } from 'react'
import { forwardRef, useId } from 'react'
import { twMerge } from 'tailwind-merge'
import InputGroup from './InputGroup'

interface Props extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'value'> {
  value?: boolean
  label: string | ReactNode
  isInvalid?: boolean
  error?: string
  helperText?: string
  containerClassName?: string
  size?: 'sm' | 'lg' | 'xl'
  disableSubmitOnEnter?: boolean
  mention?: string
}

const sizesClassNames = { sm: '', lg: 'w-8 h-8', xl: 'w-10 h-10' }

export default forwardRef(function CheckboxInput(
  {
    name,
    label,
    error,
    helperText,
    className,
    containerClassName,
    onChange,
    value,
    defaultChecked,
    required = false,
    disabled,
    size = 'sm',
    disableSubmitOnEnter = false,
    mention,
    ...props
  }: Props,
  ref: ForwardedRef<HTMLInputElement>
) {
  const id = useId()
  const checkboxId = `checkbox-${id}`

  return (
    <InputGroup
      name={name ?? ''}
      error={error}
      helperText={helperText}
      containerClassName={containerClassName}
      required={required}
      disabled={disabled}
      mention={mention}>
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          name={name}
          id={checkboxId}
          type="checkbox"
          className={twMerge(
            'focus:ring-primary-700 accent-primary-700 cursor-pointer rounded-xl border-2 border-solid border-gray-200 bg-gray-100 text-2xl transition-colors focus:ring-2 focus:ring-offset-3 focus:outline-hidden',
            sizesClassNames[size],
            error ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : '',
            disabled ? 'cursor-not-allowed opacity-50' : '',
            className
          )}
          onChange={onChange}
          onKeyDown={
            disableSubmitOnEnter
              ? onKeyDownHelper(() => {
                  // Avoid submitting the form when the checkbox is clicked, with keyboard navigation
                  document.getElementById(`${checkboxId}-label`)?.click()
                })
              : undefined
          }
          aria-describedby={error ? `error-${name}` : undefined}
          checked={value}
          defaultChecked={defaultChecked}
          required={required}
          aria-disabled={disabled}
          {...props}
        />

        <label
          id={`${checkboxId}-label`}
          htmlFor={checkboxId}
          className={twMerge(
            'cursor-pointer text-base',
            error ? 'text-red-700' : 'text-slate-900',
            disabled ? 'cursor-not-allowed opacity-50' : ''
          )}>
          <Trans>{label}</Trans>
        </label>
      </div>
    </InputGroup>
  )
})
