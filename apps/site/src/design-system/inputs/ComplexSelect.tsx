import type { PropsWithChildren } from 'react'
import type {
  ActionMeta,
  GroupBase,
  MultiValue,
  SingleValue,
} from 'react-select'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import { defaultInputStyleClassNames } from './TextInput'

interface Props {
  options: (string | number | GroupBase<string | number>)[]
  name: string
  label?: string
  error?: string
  helperText?: string
  className?: string
  onChange?: (
    newValue: MultiValue<string | number> | SingleValue<string | number>,
    actionMeta: ActionMeta<string | number>
  ) => void
  value?: string | number | GroupBase<string | number>
  required?: boolean
  isMulti?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  isAsync?: boolean
  styles?: Record<string, unknown>
}

export default function ComplexSelect({
  options,
  name,
  label,
  error,
  helperText,
  isMulti,
  isClearable,
  isSearchable = false,
  className,
  onChange,
  value,
  required = false,
  isAsync = false,
  ...props
}: PropsWithChildren<Props>) {
  const SelectTag = isAsync ? AsyncSelect : Select

  return (
    <div className={`flex flex-col ${className}`} aria-live="polite">
      <label htmlFor={name}>
        <span
          className={`text-sm font-bold text-slate-900 ${
            error ? 'text-red-700!' : ''
          }`}>
          {label}
        </span>
      </label>

      {helperText && (
        <span className="mt-1 text-xs text-slate-500">{helperText}</span>
      )}

      <SelectTag
        // @ts-expect-error fix me
        defaultValue={value}
        options={options}
        isMulti={isMulti}
        isClearable={isClearable}
        isSearchable={isSearchable}
        onChange={onChange}
        aria-describedby={`select-multi-error-${name}`}
        required={required}
        classNames={{
          control: () =>
            `min-h-none md:min-h-[38px] p-2! py-3! rounded-md text-sm focus:border-primary-700 focus:ring-2 focus:ring-primary-700 ${defaultInputStyleClassNames}`,
          valueContainer: () => 'p-0 pl-2',
          input: () => `p-0! m-0! border-none`,
          option: () => 'text-xs cursor-pointer',
          indicatorSeparator: () => 'hidden',
        }}
        components={{
          NoOptionsMessage: () => (
            <span className="p-1 pl-2 text-sm">Aucune option disponible</span>
          ),
        }}
        {...props}
      />

      {error && (
        <span
          id={`select-multi-error-${name}`}
          className="mt-2 text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  )
}
