'use client'

import type { Evaluation } from 'publicodes'
import { type ComponentProps } from 'react'
import type { NumericFormat } from 'react-number-format'
import RawNumberInput from './numberInput/RawNumberInput'

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
  value,
  placeholder,
  setValue,
  className,
  id,
  ...props
}: ComponentProps<typeof NumericFormat> & Props) {
  return (
    <RawNumberInput
      className={className}
      value={value}
      placeholder={placeholder}
      handleValueChange={(values) => setValue(values.floatValue)}
      id={id}
      unit={unit}
      {...props}
    />
  )
}
