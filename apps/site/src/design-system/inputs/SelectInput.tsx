import type {
  ChangeEvent,
  ForwardedRef,
  PropsWithChildren,
  ReactNode,
} from 'react'
import { forwardRef, useId } from 'react'
import { twMerge } from 'tailwind-merge'
import InputGroup from './InputGroup'
import { defaultInputStyleClassNames } from './TextInput'

export default forwardRef(function SelectInput(
  {
    children,
    name,
    label,
    error,
    helperText,
    className,
    containerClassName,
    onChange,
    value,
    required = false,
    disabled,
    mention,
    ...props
  }: PropsWithChildren<{
    name: string
    label?: string | ReactNode
    error?: string
    helperText?: string
    className?: string
    containerClassName?: string
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
    value?: string | number
    required?: boolean
    disabled?: boolean
    mention?: string
  }>,
  ref: ForwardedRef<HTMLSelectElement>
) {
  const id = useId()
  const selectId = `select-${id}`

  return (
    <InputGroup
      name={name}
      label={label}
      error={error}
      helperText={helperText}
      containerClassName={containerClassName}
      required={required}
      disabled={disabled}
      mention={mention}>
      <select
        id={selectId}
        ref={ref}
        name={name}
        value={value}
        onChange={onChange ?? (() => null)}
        required={required}
        aria-disabled={disabled}
        className={twMerge(
          'w-full max-w-[30rem] cursor-pointer appearance-none p-4 pr-12 text-base',
          defaultInputStyleClassNames,
          error ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          'focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 1rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25rem',
        }}
        {...props}>
        {children}
      </select>
    </InputGroup>
  )
})
