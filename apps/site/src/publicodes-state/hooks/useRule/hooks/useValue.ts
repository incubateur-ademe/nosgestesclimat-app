'use client'

import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode } from 'publicodes'
import { useMemo } from 'react'

interface Props {
  evaluation: EvaluatedNode | null
  type: string | undefined
}

export default function useValue({ evaluation, type }: Props) {
  const value = useMemo<NodeValue>(() => evaluation?.nodeValue, [evaluation])

  const displayValue = useMemo<string>(() => {
    if (type === 'choices') {
      const stringValue = String(value)
      return stringValue?.startsWith("'")
        ? stringValue.substring(1, stringValue.length - 1)
        : stringValue
    }
    if (type === 'boolean') {
      return value === true
        ? 'oui'
        : value === false || value === null // `value` is null when `ruleDisabledByItsParent` knowing that the parent becomes `null` according to this value.
          ? 'non'
          : ''
    }
    if (type === 'numberMosaic' || type === 'selectMosaic') {
      return 'mosaic'
    }
    if (Number(value) === value) {
      return String(value)
    }
    return ''
  }, [value, type])

  const numericValue = useMemo<number>(
    () => (Number(value) === value ? value : 0),
    [value]
  )

  return {
    value,
    displayValue,
    numericValue,
  }
}
