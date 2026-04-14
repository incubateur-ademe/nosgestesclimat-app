'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { Evaluation } from 'publicodes'
import { type ComponentProps } from 'react'
import type { NumberFormatValues, SourceInfo } from 'react-number-format'
import { NumericFormat } from 'react-number-format'
import { twMerge } from 'tailwind-merge'

interface Props {
  unit?: string
  value?: Evaluation<number> | string
  placeholder?: string
  handleValueChange: (value: NumberFormatValues, sourceInfo: SourceInfo) => void
  id?: string
  className?: string
}

export default function RawNumberInput({
  unit,
  value,
  placeholder,
  handleValueChange,
  className,
  id,
  ...props
}: ComponentProps<typeof NumericFormat> & Props) {
  return (
    <div
      className={twMerge(`flex items-center justify-start gap-1`, className)}>
      <NumericFormat
        value={value}
        placeholder={placeholder}
        className={twMerge(
          `max-w-[8rem] rounded-xl border border-solid border-slate-500 bg-white p-4 text-right text-base transition-colors md:max-w-full`,
          'focus:ring-primary-700! placeholder:text-slate-500! focus:ring-2! focus:ring-offset-3! focus:outline-hidden!',
          className
        )}
        thousandSeparator={' '}
        decimalSeparator={','}
        allowNegative={false}
        autoComplete="off"
        onValueChange={handleValueChange}
        inputMode="decimal"
        min={0}
        id={id}
        {...props}
      />

      {unit ? (
        <span className="whitespace-nowrap">
          &nbsp;
          <Trans>{unit}</Trans>
        </span>
      ) : null}
    </div>
  )
}
