import type { ReactNode } from 'react'
import React, { useId } from 'react'
import { twMerge } from 'tailwind-merge'

interface InputGroupProps {
  name: string
  label?: string | ReactNode
  error?: string | ReactNode
  helperText?: string | ReactNode
  srOnlyHelperText?: string | ReactNode
  containerClassName?: string
  labelClassName?: string
  required?: boolean
  disabled?: boolean
  mention?: string
  children: ReactNode
}

export default function InputGroup({
  name,
  label,
  error,
  helperText,
  srOnlyHelperText,
  containerClassName,
  labelClassName,
  required = false,
  disabled,
  mention,
  children,
}: InputGroupProps) {
  const id = useId()
  const fieldId = `field-${id}`
  const helperTextId = `helper-${id}`
  const srOnlyHelperTextId = `srOnlyHelper-${id}`
  const errorId = `error-${id}`

  const describedBy = [
    helperText ? helperTextId : undefined,
    error ? errorId : undefined,
    srOnlyHelperText ? srOnlyHelperTextId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={twMerge(
        'flex w-full flex-col items-start',
        containerClassName
      )}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={twMerge(
            'mb-2 flex w-full max-w-[30rem] justify-between text-left',
            labelClassName
          )}>
          <span
            className={twMerge(
              `w-full text-base font-bold text-slate-900`,
              error ? 'text-red-800 dark:text-red-50' : ''
            )}>
            {label}
          </span>
          {mention && (
            <span className="text-base font-bold text-pink-600">{mention}</span>
          )}
        </label>
      ) : null}

      {srOnlyHelperText ? (
        <span
          id={srOnlyHelperTextId}
          className={twMerge('sr-only -mt-1 mb-2 text-base text-slate-900')}>
          {srOnlyHelperText}
        </span>
      ) : null}

      {helperText ? (
        <span
          id={helperTextId}
          className={twMerge(
            '-mt-1 mb-2 text-base text-slate-900',
            error && 'text-red-800 dark:text-red-50'
          )}>
          {helperText}
        </span>
      ) : null}

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            'aria-describedby': describedBy,
            disabled,
            required,
          } as Record<string, unknown>)
        }
        return child
      })}

      {error && (
        <span
          id={errorId}
          role="alert"
          data-testid={`error-${name}`}
          className="mt-2 text-sm text-red-800 dark:text-red-50">
          {error}
        </span>
      )}
    </div>
  )
}
