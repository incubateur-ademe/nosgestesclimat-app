import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Evaluation } from 'publicodes'
import AssistanceSwitch from './numberInput/AssistanceSwitch'
import RawNumberInput from './numberInput/RawNumberInput'
import { useNumberInputWithAssistanceState } from './numberInput/useNumberInputWithAssistanceState'

interface Props {
  question: DottedName
  assistance: DottedName
  placeholder: string
  value: Evaluation<number>
  setValue: (value: number | undefined) => void
  unit: string
  className?: string
  id: string
}

export default function NumberInputWithAssistance({
  question,
  assistance,
  placeholder,
  value,
  setValue,
  unit: defaultUnit,
  className,
  id,
  ...props
}: Props) {
  const {
    currentUnit,
    assistanceUnit,
    updateCurrentUnit,
    value: currentValue,
    placeholder: currentPlaceholder,
    handleValueChange,
  } = useNumberInputWithAssistanceState({
    question,
    value,
    unit: defaultUnit,
    placeholder,
    setValue,
    assistance,
  })

  return (
    <>
      <AssistanceSwitch
        currentUnit={currentUnit!}
        defaultUnit={defaultUnit}
        assistanceUnit={assistanceUnit!}
        updateCurrentUnit={updateCurrentUnit}
      />

      <RawNumberInput
        className={className}
        key={currentUnit}
        value={currentValue as Evaluation<number>}
        placeholder={currentPlaceholder}
        handleValueChange={handleValueChange}
        unit={currentUnit}
        id={id}
        {...props}
      />
    </>
  )
}
