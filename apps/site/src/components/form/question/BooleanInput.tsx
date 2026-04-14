import ChoiceInput from '@/components/misc/ChoiceInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { requestIdleCallback } from '@/utils/requestIdleCallback'
import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useState } from 'react'

interface Props {
  value: NodeValue
  setValue: (value: string | undefined) => void
  'data-testid': string
  label: string
  firstInputId?: string
}

export default function BooleanInput({
  value,
  setValue,
  label,
  firstInputId,
  ...props
}: Props) {
  const { t } = useClientTranslation()
  const [currentValue, setCurrentValue] = useState(value)

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{label}</legend>

      <ChoiceInput
        label={t('Oui')}
        labelText={t('Oui')}
        active={currentValue === true}
        onClick={() => {
          if (currentValue === true) {
            setCurrentValue(undefined)
            requestIdleCallback(() => setValue(undefined))
          } else {
            setCurrentValue(true)
            requestIdleCallback(() => setValue('oui'))
          }
        }}
        {...props}
        data-testid={`${props['data-testid']}-oui`}
        id={firstInputId}
      />

      <ChoiceInput
        label={t('Non')}
        labelText={t('Non')}
        active={currentValue === false}
        onClick={() => {
          if (currentValue === false) {
            setCurrentValue(undefined)
            requestIdleCallback(() => setValue(undefined))
          } else {
            setCurrentValue(false)
            requestIdleCallback(() => setValue('non'))
          }
        }}
        {...props}
        data-testid={`${props['data-testid']}-non`}
      />
    </fieldset>
  )
}
