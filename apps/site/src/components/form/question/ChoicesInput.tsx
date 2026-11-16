import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useEffect } from 'react'
import Choice from './choicesInput/Choice'

interface Props {
  question: DottedName
  value: string | undefined
  choices: (string | number)[] | null
  setValue: (value: string | undefined) => void
  'data-testid': string
  label: string
  firstInputId?: string
}

const SHOULD_USE_GRID_THRESHOLD = 5

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
    ? choices.length >= SHOULD_USE_GRID_THRESHOLD
    : undefined

  // A lone option is auto-selected so the user is not asked a pointless question.
  useEffect(() => {
    if (choices?.length === 1 && choices[0] && value === undefined) {
      setValue(String(choices[0]))
    }
  }, [choices, value, setValue])

  return (
    <fieldset
      className={
        isGrid
          ? 'mt-2 grid w-full auto-rows-fr grid-cols-2 gap-x-4 gap-y-2'
          : 'mt-2 grid auto-rows-fr gap-2'
      }>
      <legend className="sr-only">{label}</legend>

      {choices?.map((choice: string | number, index: number) =>
        choice ? (
          <Choice
            key={choice}
            question={question}
            choice={choice}
            active={value === choice}
            setValue={(choice: string | number) => {
              setValue(value === choice ? undefined : String(choice))
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
