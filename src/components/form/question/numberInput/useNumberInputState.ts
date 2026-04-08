import { useDebounce } from '@/utils/debounce'
import type { Evaluation } from 'publicodes'
import { useEffect, useState } from 'react'
import type { NumberFormatValues } from 'react-number-format'

interface Props {
  value?: Evaluation<number>
  setValue: (value: number | undefined) => void
}

export function useNumberInputState({ value, setValue }: Props) {
  const debouncedSetValue = useDebounce(setValue, 300)
  const defaultValue: Partial<NumberFormatValues> = {
    value: undefined,
    floatValue: value ?? undefined,
  }
  const [currentValues, setCurrentValues] = useState(defaultValue)

  const handleValueChange = (values: NumberFormatValues) => {
    setCurrentValues(values)
    debouncedSetValue(values.floatValue)
  }

  // La valeur peut être mise à jour depuis l'exterieur (via les boutons de suggestion par exemple)
  // Quand ça arrive, la valeur de `value` et `currentValues` sont désynchronisées.
  // Pour reset le champs avec la valeur passée en prop, on reset `currentValues.value` a undefined.
  useEffect(() => {
    if (value !== null && value != currentValues.floatValue) {
      setCurrentValues(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return {
    value: (currentValues.value ??
      currentValues.floatValue) as Evaluation<number>,
    onChange: handleValueChange,
  }
}
