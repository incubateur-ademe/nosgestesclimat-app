import { requestIdleCallback } from '@/utils/requestIdleCallback'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Evaluation } from 'publicodes'
import { useEffect, useState } from 'react'
import Choice from './choicesInput/Choice'

interface Props {
  question: DottedName
  value: Evaluation<string>
  choices: (string | number)[] | null
  setValue: (value: string | undefined) => void
  'data-testid': string
  label: string
  firstInputId?: string
}

const SHOULD_USE_GRID_THRESHOLD = 6

export default function ChoicesInput(props: Props) {
  const {
    question,
    value,
    choices,
    setValue,
    label,
    firstInputId,
    ...otherProps
  } = props

  // For now, it only concerns `DPE` question whose possibilities are very short, so 4 colomns is ok. However, we should have done a special question.
  const isGrid = choices
    ? choices.length > SHOULD_USE_GRID_THRESHOLD
    : undefined

  const [currentValue, setCurrentValue] = useState<
    string | number | null | undefined
  >(value)

  // The choice value can be overriden in the very specific case of divers.textile.volume question,
  // where a modification in the mosaic can change the answer in the choice question above.
  // So we need to sync its state with the one from the evaluation
  useEffect(() => {
    if (value !== undefined && currentValue !== value) {
      setCurrentValue(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // If there's only one choice and no value is selected yet, select it automatically
  useEffect(() => {
    if (
      choices?.length === 1 &&
      choices[0] &&
      value === undefined &&
      currentValue === undefined
    ) {
      const singleChoice = choices[0]
      setCurrentValue(singleChoice)
      requestIdleCallback(() => setValue(String(singleChoice)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices, value])

  return (
    <fieldset
      className={
        isGrid
          ? 'mt-2 grid w-full grid-cols-2 gap-x-4 gap-y-2'
          : 'mt-2 flex flex-col gap-2'
      }>
      <legend className="sr-only">{label}</legend>

      {choices?.map((choice: string | number, index: number) =>
        choice ? (
          <Choice
            key={choice}
            question={question}
            choice={choice}
            active={currentValue === choice}
            setValue={(choice: string | number) => {
              if (currentValue === choice) {
                setCurrentValue(undefined)
                requestIdleCallback(() => setValue(undefined))
              } else {
                setCurrentValue(choice)
                requestIdleCallback(() => setValue(String(choice)))
              }
            }}
            isWithinGrid={isGrid}
            {...otherProps}
            data-testid={`${props['data-testid']}-${choice}`}
            {...(index === 0 ? { id: firstInputId } : {})}
          />
        ) : null
      )}
    </fieldset>
  )
}
