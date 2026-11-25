import { useState } from 'react'
import type { NumberFormatValues, SourceInfo } from 'react-number-format'
import AssistanceSwitch from './numberInput/AssistanceSwitch'
import RawNumberInput from './numberInput/RawNumberInput'

interface AssistanceProjection {
  value: number | undefined
  situationValue: number | undefined
  unit: string | undefined
  setValue: (value: number | undefined) => void
}

interface Props {
  assistance: AssistanceProjection
  placeholder: string
  value: number | undefined
  setValue: (value: number | undefined) => void
  unit: string | undefined
  className?: string
  id: string
}

/**
 * Which unit to type in by default: the assistance one while the assistance
 * answer is the only one, the question's own one as soon as it is answered
 * directly.
 */
const getWhichUnitToShowByDefault = ({
  assistanceValue,
  questionValue,
  assistanceUnit,
  defaultUnit,
}: {
  assistanceValue: number | undefined
  questionValue: number | undefined
  assistanceUnit: string
  defaultUnit: string
}) => {
  if (!assistanceValue && questionValue) return defaultUnit
  return assistanceUnit
}

interface SwitchableProps {
  assistance: AssistanceProjection
  assistanceUnit: string
  defaultUnit: string
  questionValue: number | undefined
  placeholder: string
  setValue: (value: number | undefined) => void
  className?: string
  id: string
}

/** The input when both units are known, so the switch can offer both. */
function SwitchableInput({
  assistance,
  assistanceUnit,
  defaultUnit,
  questionValue,
  placeholder,
  setValue,
  className,
  id,
  ...props
}: SwitchableProps) {
  const [currentUnit, updateCurrentUnit] = useState(() =>
    getWhichUnitToShowByDefault({
      assistanceUnit,
      assistanceValue: assistance.situationValue,
      questionValue,
      defaultUnit,
    })
  )

  const isAssistanceMode = currentUnit === assistanceUnit

  const handleValueChange = (
    values: NumberFormatValues,
    sourceInfo: SourceInfo
  ) => {
    // Only genuine user input: a prop-driven change would loop back into the
    // draft it comes from.
    if (!sourceInfo.event) return

    if (isAssistanceMode) {
      assistance.setValue(values.floatValue)
      return
    }
    setValue(values.floatValue)
  }

  return (
    <>
      <AssistanceSwitch
        currentUnit={currentUnit}
        defaultUnit={defaultUnit}
        assistanceUnit={assistanceUnit}
        updateCurrentUnit={updateCurrentUnit}
      />
      <RawNumberInput
        className={className}
        key={currentUnit}
        value={isAssistanceMode ? assistance.value : questionValue}
        placeholder={isAssistanceMode ? undefined : placeholder}
        handleValueChange={handleValueChange}
        unit={currentUnit}
        id={id}
        {...props}
      />
    </>
  )
}

export default function NumberInputWithAssistance({
  assistance,
  placeholder,
  value,
  setValue,
  unit: defaultUnit,
  className,
  id,
  ...props
}: Props) {
  const { unit: assistanceUnit } = assistance

  // A rule missing either unit gets a plain input, in whichever unit it has.
  if (!defaultUnit || !assistanceUnit) {
    return (
      <RawNumberInput
        className={className}
        value={value}
        placeholder={placeholder}
        handleValueChange={(values) => setValue(values.floatValue)}
        unit={defaultUnit}
        id={id}
        {...props}
      />
    )
  }

  return (
    <SwitchableInput
      assistance={assistance}
      assistanceUnit={assistanceUnit}
      defaultUnit={defaultUnit}
      questionValue={value}
      placeholder={placeholder}
      setValue={setValue}
      className={className}
      id={id}
      {...props}
    />
  )
}
