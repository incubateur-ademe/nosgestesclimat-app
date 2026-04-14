import { useCurrentSimulation, useRule } from '@/publicodes-state'
import type { Situation } from '@/publicodes-state/types'
import { useDebounce } from '@/utils/debounce'
import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat/types/dottedNames'
import { useEffect, useState } from 'react'

function ouiNonToBoolean(value: unknown): unknown {
  if (value === 'oui') return true
  if (value === 'non') return false
  return value
}

export function useMosaicState({
  questionsOfMosaic,
  question,
}: {
  questionsOfMosaic: DottedName[]
  question: DottedName
}): {
  values: Partial<Record<DottedName, boolean | undefined | number | ''>>
  setValue: (
    dottedName: DottedName,
    value: boolean | number | '' | undefined
  ) => void
  aucunOption:
    | {
        value: boolean
        setValue: (value: boolean) => void
        label: 'aucun' | 'non concerné'
      }
    | undefined
} {
  const rule = useRule(question)

  const aucunOption = rule.aucunOption

  const { situation } = useCurrentSimulation()

  const setValuesLater = useDebounce(rule.setValue, 800)
  const setValuesNow = useDebounce(rule.setValue, 0)

  const [aucunOptionSelected, setAucunOptionSelected] = useState(false)

  const stateFromSituation: (
    situation: Situation
  ) => Partial<Record<DottedName, boolean | undefined | number | ''>> = () =>
    Object.fromEntries(
      questionsOfMosaic.map((question) => [
        question,
        situation[question] === null
          ? undefined
          : ouiNonToBoolean(situation[question]),
      ])
    )

  const [state, setState] = useState(stateFromSituation(situation))

  useEffect(() => {
    const newState: Partial<
      Record<DottedName, boolean | undefined | number | ''>
    > = Object.fromEntries(
      Object.entries(stateFromSituation(situation)).map(([key, value]) => {
        if (state[key as DottedName] === null && value === 0) {
          return [key, null]
        }
        // allow to keep '' in mosaic state when situation value is 0
        if (state[key as DottedName] === '' && value === 0) {
          return [key, '']
        }
        return [key, value]
      })
    )
    setState(newState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation])

  const handleSetAucunOption = (selected: boolean) => {
    setAucunOptionSelected(selected)
    let newState = { ...state }
    if (
      // If aucun is set
      selected === true
    ) {
      // Then we initialize all values to null
      newState = Object.fromEntries(
        questionsOfMosaic.map((question) => [question, null])
      )
    }

    if (
      // If aucun is unset
      selected === false
    ) {
      // Then we reinitialize all values to undefined (default state)
      newState = Object.fromEntries(
        questionsOfMosaic.map((question) => [question, undefined])
      )
    }

    setState(newState)

    // Propagate to the actual situation
    setValuesNow(newState as Record<string, NodeValue>, {
      questionDottedName: question,
    })
  }

  const handleSetValue = (
    dottedName: DottedName,
    value: boolean | number | '' | undefined
  ) => {
    let newState = { ...state }
    // If all values are undefined, then initialize all mosaic to null
    if (Object.values(newState).every((v) => v === undefined)) {
      newState = Object.fromEntries(
        questionsOfMosaic.map((question) => [question, null])
      )
    }

    newState[dottedName] = value

    // If value is false and all other values are false, then we unset all values (default state)
    if (value === false && Object.values(newState).every((v) => v === false)) {
      // Then we reinitialize all values to undefined (default state)
      newState = Object.fromEntries(
        questionsOfMosaic.map((question) => [question, undefined])
      )
    }

    // If some value is not (null, 0, false or undefined) then aucun is set to false and we propagate null to other values
    if (Object.entries(newState).some(([, v]) => !!v)) {
      setAucunOptionSelected(false)
    }

    setState(newState)
    const newSituation: Record<string, NodeValue> = { ...newState }

    // If value is '' and all other are not '', then situation value is set to null
    if (value === '') {
      newSituation[dottedName] = null
    }

    ;(typeof value === 'number' ? setValuesLater : setValuesNow)(newSituation, {
      questionDottedName: question,
    })
  }

  return {
    values: state,
    setValue: handleSetValue,
    aucunOption: aucunOption
      ? {
          value: aucunOptionSelected,
          setValue: handleSetAucunOption,
          label: aucunOption,
        }
      : undefined,
  }
}
