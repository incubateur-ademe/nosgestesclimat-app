'use client'

import type { Evaluation } from 'publicodes'
import { type ComponentProps } from 'react'
import type { NumericFormat } from 'react-number-format'
import RawNumberInput from './numberInput/RawNumberInput'
import { useNumberInputState } from './numberInput/useNumberInputState'

interface Props {
  unit?: string
  value?: Evaluation<number>
  placeholder?: string
  setValue: (value: number | undefined) => void
  id?: string
  className?: string
}

export default function NumberInput({
  unit,
  value: defaultValue,
  placeholder,
  setValue,
  className,
  id,
  ...props
}: ComponentProps<typeof NumericFormat> & Props) {
  const { value, onChange } = useNumberInputState({
    value: defaultValue,
    setValue,
  })

  return (
    <RawNumberInput
      className={className}
      value={value}
      placeholder={value === undefined ? placeholder : ''}
      handleValueChange={onChange}
      id={id}
      unit={unit}
      {...props}
    />
  )
}
