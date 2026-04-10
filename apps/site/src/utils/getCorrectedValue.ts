// Publicodes's % unit is strangely handlded
// the nodeValue is * 100 to account for the unit

import type { EvaluatedNode } from 'publicodes'

// hence we divide it by 100 and drop the unit
export function getCorrectedValue({
  nodeValue,
  unit,
}: EvaluatedNode): number | undefined {
  if (nodeValue == undefined || typeof nodeValue !== 'number') {
    return undefined
  }

  const result = unit?.numerators.includes('%') ? nodeValue / 100 : nodeValue
  return result
}
