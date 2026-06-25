'use client'

import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useMemo } from 'react'

interface Props {
  value: NodeValue
  type: string | undefined
}

export default function useDisplayValue({ value, type }: Props) {
  const displayValue = useMemo<string>(() => {
    if (type === 'choices') {
      const stringValue = String(value)
      return stringValue.startsWith("'")
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

  return {
    displayValue,
  }
}
