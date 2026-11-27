import { QUESTION_DESCRIPTION_BUTTON_ID } from '@/constants/accessibility'
import { Slider } from '../shadcn/slider'

const DEFAULT_STEP = 1

interface Props {
  id: string
  instructionLabel: string
  value: number
  onValueChange: (value: number) => void
  onValueCommit: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  hint?: string
  minLabel?: string
  maxLabel?: string
}

export default function SliderNumberInput({
  id,
  instructionLabel,
  value,
  onValueChange,
  onValueCommit,
  min,
  max,
  step = DEFAULT_STEP,
  unit,
  hint,
  minLabel,
  maxLabel,
}: Props) {
  return (
    <div className="w-xl max-w-full">
      <p id={`${id}-instruction`} className="mb-0 text-base font-medium">
        {instructionLabel}
      </p>

      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="m-0 text-4xl font-bold md:text-5xl">
          {value}
          {unit ? (
            <span className="ml-1 align-super text-lg font-semibold">
              {unit}
            </span>
          ) : null}
        </p>

        {hint ? (
          <span className="bg-primary-100 text-primary-700 rounded-md px-2 py-1 text-sm font-medium">
            {hint}
          </span>
        ) : null}
      </div>

      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([nextValue]) => onValueChange(nextValue)}
        onValueCommit={([nextValue]) => onValueCommit(nextValue)}
        thumbProps={{
          'aria-labelledby': 'question-label',
          'aria-describedby': `${QUESTION_DESCRIPTION_BUTTON_ID}-content ${id}-instruction`,
          'aria-valuetext': formatValueText({ value, unit, hint }),
          'data-testid': id,
        }}
      />

      <div className="text-primary-700 mt-2 flex justify-between text-sm md:text-base">
        <span>{formatBoundLabel({ label: minLabel, bound: min, unit })}</span>
        <span>{formatBoundLabel({ label: maxLabel, bound: max, unit })}</span>
      </div>
    </div>
  )
}

function formatBoundLabel({
  label,
  bound,
  unit,
}: {
  label?: string
  bound: number
  unit?: string
}): string {
  if (label) return label
  return unit ? `${bound} ${unit}` : String(bound)
}

function formatValueText({
  value,
  unit,
  hint,
}: {
  value: number
  unit?: string
  hint?: string
}): string {
  return [unit ? `${value} ${unit}` : String(value), hint]
    .filter(Boolean)
    .join(', ')
}
