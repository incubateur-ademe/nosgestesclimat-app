import type {
  ChangeEventHandler,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from 'react'
import { forwardRef, useId } from 'react'
import InputGroup from './InputGroup'
import { twMerge } from "cn";

export const defaultInputStyleClassNames = `rounded-md border border-solid border-slate-500 bg-white transition-colors placeholder:text-slate-500`

interface Props {
  name: string
  label?: string | ReactNode
  type?: string
  isInvalid?: boolean
  error?: string | ReactNode
  helperText?: string | ReactNode
  srOnlyHelperText?: string | ReactNode
  className?: string
  containerClassName?: string
  placeholder?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  value?: string | number
  required?: boolean
  maxLength?: number
  disabled?: boolean
  readOnly?: boolean
  'data-testid'?: string
  autoComplete?: string
  mention?: string
}

export default forwardRef(function TextInput(
  {
    name,
    label,
    type = 'text',
    error,
    helperText,
    srOnlyHelperText,
    mention,
    className,
    containerClassName,
    placeholder,
    onChange,
    value,
    required = false,
    disabled,
    readOnly = false,
    autoComplete = 'off',
    ...props
  }: HTMLAttributes<HTMLInputElement> & Props,
  ref: ForwardedRef<HTMLInputElement>
) {
  const id = useId()
  const inputId = `input-${id}`
  return (
    <InputGroup
      name={name}
      label={label}
      error={error}
      helperText={helperText}
      srOnlyHelperText={srOnlyHelperText}
      containerClassName={containerClassName}
      required={required}
      disabled={disabled}
      mention={mention}>
      <input
        id={inputId}
        ref={ref}
        readOnly={readOnly}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        defaultValue={value}
        required={required}
        aria-disabled={disabled}
        autoComplete={autoComplete}
        data-testid={`${props['data-testid']}`}
        {...props}
        type={type}
        className={twMerge(
          'w-full max-w-120 p-4 text-base',
          defaultInputStyleClassNames,
          error ? 'border-red-200! bg-red-50! ring-2 ring-red-700!' : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          readOnly
            ? 'cursor-not-allowed'
            : 'focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden',
          className
        )}
      />
    </InputGroup>
  )
})
